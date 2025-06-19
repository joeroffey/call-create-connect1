
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@1.25.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PineconeUpsertRequest {
  vectors: Array<{
    id: string;
    values: number[];
    metadata: {
      text: string;
      source: string;
      url: string;
      lastUpdated: string;
      section?: string;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting building regulations update process...');

    // Get environment variables
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_KEY');
    const pineconeKey = Deno.env.get('PINECONE_KEY');
    const pineconeHost = Deno.env.get('PINECONE_HOST');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlKey || !openaiKey || !pineconeKey || !pineconeHost || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize services
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });

    console.log('Crawling UK Building Regulations website...');

    // Crawl the building regulations website
    const crawlResponse = await firecrawl.crawlUrl('https://www.gov.uk/building-regulations-approval', {
      limit: 50,
      scrapeOptions: {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      },
      allowBackwardLinks: true,
    });

    if (!crawlResponse.success) {
      throw new Error(`Crawl failed: ${crawlResponse.error || 'Unknown error'}`);
    }

    console.log(`Successfully crawled ${crawlResponse.data.length} pages`);

    // Process and chunk the content
    const chunks = [];
    for (const page of crawlResponse.data) {
      if (page.markdown && page.markdown.length > 100) {
        // Split large content into smaller chunks
        const pageChunks = chunkText(page.markdown, 1000, 200);
        pageChunks.forEach((chunk, index) => {
          chunks.push({
            text: chunk,
            source: page.metadata?.title || 'UK Building Regulations',
            url: page.metadata?.sourceURL || 'https://www.gov.uk/building-regulations-approval',
            chunkIndex: index,
            totalChunks: pageChunks.length
          });
        });
      }
    }

    console.log(`Created ${chunks.length} text chunks for embedding`);

    // Generate embeddings for all chunks
    const vectors = [];
    const batchSize = 20; // Process in batches to avoid rate limits
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Processing embedding batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);
      
      const embeddings = await generateEmbeddings(batch.map(chunk => chunk.text), openaiKey);
      
      batch.forEach((chunk, batchIndex) => {
        vectors.push({
          id: `building-reg-${Date.now()}-${i + batchIndex}`,
          values: embeddings[batchIndex],
          metadata: {
            text: chunk.text,
            source: chunk.source,
            url: chunk.url,
            lastUpdated: new Date().toISOString(),
            section: extractSection(chunk.text),
          }
        });
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Generated ${vectors.length} embeddings, upserting to Pinecone...`);

    // Clear old building regulations data and upsert new data
    await clearOldBuildingRegs(pineconeHost, pineconeKey);
    await upsertToPinecone(vectors, pineconeHost, pineconeKey);

    // Log the update in Supabase
    const { error: logError } = await supabase
      .from('building_regs_updates')
      .insert({
        update_date: new Date().toISOString(),
        pages_crawled: crawlResponse.data.length,
        chunks_processed: chunks.length,
        vectors_created: vectors.length,
        status: 'completed'
      });

    if (logError) {
      console.error('Error logging update:', logError);
    }

    console.log('Building regulations update completed successfully');

    return new Response(JSON.stringify({
      success: true,
      pagesCrawled: crawlResponse.data.length,
      chunksProcessed: chunks.length,
      vectorsCreated: vectors.length,
      message: 'Building regulations updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in building-regs-updater:', error);
    
    // Log the error in Supabase
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('building_regs_updates')
          .insert({
            update_date: new Date().toISOString(),
            status: 'failed',
            error_message: error.message
          });
      }
    } catch (logError) {
      console.error('Error logging failure:', logError);
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function chunkText(text: string, maxChunkSize: number, overlap: number): string[] {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxChunkSize;
    
    // Try to break at sentence or paragraph boundaries
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('.', end);
      const paragraphEnd = text.lastIndexOf('\n\n', end);
      const breakPoint = Math.max(sentenceEnd, paragraphEnd);
      
      if (breakPoint > start + maxChunkSize * 0.5) {
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
}

function extractSection(text: string): string | undefined {
  // Try to extract section information from the text
  const sectionMatch = text.match(/(?:Part|Section|Regulation)\s+([A-Z]|\d+)/i);
  return sectionMatch ? sectionMatch[0] : undefined;
}

async function generateEmbeddings(texts: string[], openaiKey: string): Promise<number[][]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.data.map((item: any) => item.embedding);
}

async function clearOldBuildingRegs(pineconeHost: string, pineconeKey: string): Promise<void> {
  console.log('Clearing old building regulations data...');
  
  // Delete vectors with building regulations metadata
  const deleteResponse = await fetch(`${pineconeHost}/vectors/delete`, {
    method: 'POST',
    headers: {
      'Api-Key': pineconeKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        source: { "$in": ["UK Building Regulations", "Building Regulations"] }
      }
    }),
  });

  if (!deleteResponse.ok) {
    console.warn('Failed to clear old data, continuing with upsert...');
  } else {
    console.log('Successfully cleared old building regulations data');
  }
}

async function upsertToPinecone(vectors: any[], pineconeHost: string, pineconeKey: string): Promise<void> {
  const batchSize = 100; // Pinecone batch limit
  
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    console.log(`Upserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vectors.length/batchSize)} to Pinecone`);
    
    const response = await fetch(`${pineconeHost}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vectors: batch }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone upsert failed: ${response.status} - ${errorText}`);
    }

    // Small delay between batches
    if (i + batchSize < vectors.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`Successfully upserted ${vectors.length} vectors to Pinecone`);
}

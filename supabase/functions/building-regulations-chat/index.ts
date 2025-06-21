
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    text: string;
    source?: string;
    section?: string;
    images?: Array<{
      url: string;
      title: string;
      page: number;
    }>;
  };
}

interface PineconeResponse {
  matches: PineconeMatch[];
}

interface ProjectDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, projectContext } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    // Get environment variables
    const openaiKey = Deno.env.get('OPENAI_KEY');
    const pineconeKey = Deno.env.get('PINECONE_KEY');
    const pineconeHost = Deno.env.get('PINECONE_HOST');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasOpenAI: !!openaiKey,
      hasPineconeKey: !!pineconeKey,
      hasPineconeHost: !!pineconeHost,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      pineconeHost: pineconeHost
    });

    if (!openaiKey || !pineconeKey || !pineconeHost) {
      console.error('Missing environment variables:', {
        openaiKey: !!openaiKey,
        pineconeKey: !!pineconeKey,
        pineconeHost: !!pineconeHost
      });
      throw new Error('Missing required API keys or configuration. Please ensure all secrets are properly configured.');
    }

    console.log('Processing message:', message);
    console.log('Project context:', projectContext);

    // Initialize Supabase client for document access
    let supabase = null;
    let projectDocuments: ProjectDocument[] = [];
    let documentContext = '';

    if (supabaseUrl && supabaseServiceKey && projectContext?.id) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Fetch project documents
      const { data: documents, error: docsError } = await supabase
        .from('project_documents')
        .select('id, file_name, file_path, file_type, file_size')
        .eq('project_id', projectContext.id);

      if (docsError) {
        console.error('Error fetching project documents:', docsError);
      } else {
        projectDocuments = documents || [];
        console.log(`Found ${projectDocuments.length} documents for project`);

        // Extract content from documents with enhanced analysis
        if (projectDocuments.length > 0) {
          documentContext = await extractDocumentContentWithAnalysis(supabase, projectDocuments, openaiKey, message);
          console.log('Document context extracted, length:', documentContext.length);
        }
      }
    }

    // Step 1: Create embedding for the user's question
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI embedding error:', errorText);
      throw new Error(`OpenAI embedding failed: ${embeddingResponse.status} - ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Created embedding for query, vector length:', embedding.length);

    // Step 2: Query Pinecone for relevant building regulations documents
    const pineconeUrl = `${pineconeHost.replace(/\/$/, '')}/query`;
    console.log('Querying Pinecone at:', pineconeUrl);

    const pineconeResponse = await fetch(pineconeUrl, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: embedding,
        topK: 8,
        includeMetadata: true,
        includeValues: false,
      }),
    });

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text();
      console.error('Pinecone error:', {
        status: pineconeResponse.status,
        statusText: pineconeResponse.statusText,
        error: errorText,
        url: pineconeUrl
      });
      throw new Error(`Pinecone query failed: ${pineconeResponse.status} - ${errorText}. Please check your Pinecone configuration.`);
    }

    const pineconeData: PineconeResponse = await pineconeResponse.json();
    console.log('Retrieved documents from Pinecone:', {
      matchCount: pineconeData.matches?.length || 0,
      scores: pineconeData.matches?.map(m => m.score) || []
    });

    // Step 3: Extract relevant context and images from the matched documents
    const relevantMatches = pineconeData.matches?.filter(match => match.score > 0.25) || [];
    console.log('Filtered matches above 0.25 threshold:', relevantMatches.length);

    // Collect images from relevant matches
    const relatedImages: Array<{url: string, title: string, source: string}> = [];
    relevantMatches.forEach(match => {
      if (match.metadata.images && Array.isArray(match.metadata.images)) {
        match.metadata.images.forEach(img => {
          relatedImages.push({
            url: img.url,
            title: img.title || `Building Regulation Diagram - Page ${img.page}`,
            source: match.metadata.source || 'UK Building Regulations'
          });
        });
      }
    });

    console.log('Found related images:', relatedImages.length);

    if (relevantMatches.length === 0) {
      console.log('No matches above 0.25 threshold, using top 3 matches regardless of score');
      const topMatches = pineconeData.matches?.slice(0, 3) || [];
      const relevantContext = topMatches
        .map(match => `[Score: ${match.score.toFixed(3)}] ${match.metadata.text}`)
        .join('\n\n---\n\n');
      
      if (!relevantContext || relevantContext.trim() === '') {
        return new Response(JSON.stringify({
          response: "I apologise, but I couldn't find any relevant information in the UK Building Regulations documents to answer your question. This might be because the question is outside the scope of UK Building Regulations, or the specific information hasn't been indexed yet. Could you try rephrasing your question or being more specific about which part of the Building Regulations you're asking about?",
          images: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Using top matches with context length:', relevantContext.length);
    }

    const regulationsContext = relevantMatches
      .map(match => match.metadata.text)
      .join('\n\n---\n\n');

    console.log('Found relevant regulations context, length:', regulationsContext.length);

    // Combine building regulations context with document context
    let combinedContext = regulationsContext;
    if (documentContext) {
      combinedContext = `PROJECT DOCUMENTS:\n${documentContext}\n\n---\n\nUK BUILDING REGULATIONS:\n${regulationsContext}`;
    }

    // Step 4: Generate response using OpenAI with enhanced context
    const systemPrompt = `You are a UK Building Regulations specialist assistant. You MUST follow these strict guidelines:

1. ONLY answer questions about UK Building Regulations, planning permissions, and construction requirements
2. Use ONLY the provided context from official UK Building Regulations documents and project documents
3. Use British English spelling and terminology throughout (e.g., "colour" not "color", "metres" not "meters", "storey" not "story", "realise" not "realize", "behaviour" not "behavior")
4. If asked about non-UK regulations or unrelated topics, politely decline and redirect to UK Building Regulations
5. Always cite specific regulation parts when possible (e.g., "Part A - Structure", "Part B - Fire Safety", "Part L - Conservation of fuel and power")
6. Be precise and reference specific requirements from the documents provided
7. Use UK construction terminology (e.g., "ground floor" not "first floor", "lift" not "elevator", "tap" not "faucet")
8. If the context doesn't fully answer the question, provide what information is available and suggest consulting the full regulations
9. Always maintain a professional, helpful tone appropriate for UK construction professionals
10. Use UK units of measurement (metres, millimetres, square metres, etc.)
11. When relevant diagrams or images are available in the Building Regulations documents, mention that visual references are available to support your answer
12. When project documents are available, reference them specifically and explain how they relate to the building regulations requirements
13. If project documents contain drawings, specifications, or plans, reference these when providing advice
14. When analyzing uploaded images (floor plans, drawings, etc.), provide specific feedback on building regulation compliance visible in the images
15. For document analysis, highlight any non-compliance issues and suggest improvements where possible

${projectContext ? `PROJECT INFORMATION:
Project Name: ${projectContext.name}
Project Description: ${projectContext.description || 'Not specified'}
Project Category: ${projectContext.label || 'Not specified'}
Project Status: ${projectContext.status || 'Not specified'}
Number of Project Documents: ${projectDocuments.length}

` : ''}Context from UK Building Regulations documents${documentContext ? ' and analyzed project documents' : ''}:
${combinedContext}`;

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4o for better analysis capabilities
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('OpenAI chat error:', errorText);
      throw new Error(`OpenAI chat completion failed: ${chatResponse.status} - ${errorText}`);
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    console.log('Generated AI response successfully');

    return new Response(JSON.stringify({
      response: aiResponse,
      images: relatedImages.slice(0, 5), // Limit to 5 images max
      documentsAnalyzed: projectDocuments.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in building-regulations-chat function:', error);
    
    let errorMessage = 'I apologise, but I encountered an error processing your request. Please try again.';
    
    if (error.message.includes('Pinecone')) {
      errorMessage = 'I apologise, but there seems to be an issue connecting to the Building Regulations database. Please check that your Pinecone configuration is correct and try again.';
    } else if (error.message.includes('OpenAI')) {
      errorMessage = 'I apologise, but there seems to be an issue with the service. Please check your configuration and try again.';
    } else if (error.message.includes('Missing required API keys')) {
      errorMessage = 'I apologise, but the system configuration is incomplete. Please ensure all required keys are properly configured.';
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      details: error.message,
      images: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Enhanced function to extract and analyze content from uploaded documents
async function extractDocumentContentWithAnalysis(supabase: any, documents: ProjectDocument[], openaiKey: string, userMessage: string): Promise<string> {
  let combinedContent = '';
  
  for (const doc of documents.slice(0, 10)) { // Increased limit to 10 documents
    try {
      console.log(`Processing document: ${doc.file_name}`);
      
      // Download the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('project-documents')
        .download(doc.file_path);

      if (downloadError) {
        console.error(`Error downloading ${doc.file_name}:`, downloadError);
        continue;
      }

      let content = '';
      
      // Extract content based on file type with enhanced analysis
      if (doc.file_type === 'text/plain' || doc.file_type === 'text/csv' || doc.file_type === 'text/markdown') {
        content = await fileData.text();
      } else if (doc.file_type.startsWith('image/')) {
        // Analyze images using OpenAI Vision
        content = await analyzeImageWithVision(fileData, doc.file_name, openaiKey, userMessage);
      } else if (doc.file_type === 'application/pdf') {
        // For PDF files, we'll provide enhanced context
        content = `[PDF Document: ${doc.file_name}] - This document contains ${Math.round(doc.file_size / 1024)}KB of content that may include technical drawings, specifications, building plans, or regulatory documentation relevant to the project. The document has been uploaded for building regulations compliance review.`;
      } else if (doc.file_type.includes('word') || doc.file_type.includes('document')) {
        content = `[Word Document: ${doc.file_name}] - This document contains ${Math.round(doc.file_size / 1024)}KB of project specifications, requirements, or documentation that may include building details, compliance checklists, or technical requirements relevant to UK Building Regulations.`;
      } else if (doc.file_type.includes('spreadsheet') || doc.file_type.includes('excel')) {
        content = `[Spreadsheet: ${doc.file_name}] - This spreadsheet may contain calculations, schedules, material lists, or compliance tracking data relevant to the building project and UK Building Regulations compliance.`;
      }

      if (content) {
        combinedContent += `\n\n--- DOCUMENT: ${doc.file_name} ---\n${content}`;
      }
      
    } catch (error) {
      console.error(`Error processing document ${doc.file_name}:`, error);
      combinedContent += `\n\n--- DOCUMENT: ${doc.file_name} ---\n[Document could not be processed but is available for reference]`;
    }
  }
  
  return combinedContent;
}

// Function to analyze images using OpenAI Vision
async function analyzeImageWithVision(imageFile: Blob, fileName: string, openaiKey: string, userMessage: string): Promise<string> {
  try {
    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Array(arrayBuffer.byteLength).map((_, i) => new Uint8Array(arrayBuffer)[i])));
    
    // Determine image format
    const imageType = imageFile.type || 'image/png';
    const base64DataUrl = `data:${imageType};base64,${base64Image}`;

    console.log(`Analyzing image: ${fileName} with OpenAI Vision`);

    // Analyze the image with OpenAI Vision
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a UK Building Regulations specialist analyzing architectural drawings, floor plans, and construction documents. 

Analyze this image in the context of UK Building Regulations compliance. Focus on:
- Room layouts and dimensions
- Door and window placements
- Accessibility compliance (Part M)
- Fire safety provisions and escape routes (Part B)
- Structural elements visible (Part A)
- Ventilation and services (Parts F, G, P)
- Energy efficiency features (Part L)
- Any visible non-compliance issues
- Specific measurements if shown

Provide detailed analysis that can be used to give building regulations advice. Be specific about what you can see in the drawing/plan.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${fileName} in the context of this user question: "${userMessage}". Focus on UK Building Regulations compliance.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64DataUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('OpenAI Vision error:', errorText);
      throw new Error(`Vision analysis failed: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const analysis = visionData.choices[0].message.content;

    console.log(`Successfully analyzed ${fileName} with Vision API`);
    
    return `[IMAGE ANALYSIS: ${fileName}]\n${analysis}`;

  } catch (error) {
    console.error(`Error analyzing image ${fileName}:`, error);
    return `[Image: ${fileName}] - This image contains visual documentation relevant to the project but could not be analyzed. It may include drawings, plans, or visual documentation that should be manually reviewed for building regulations compliance.`;
  }
}

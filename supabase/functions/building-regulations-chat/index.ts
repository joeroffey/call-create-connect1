
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
  };
}

interface PineconeResponse {
  matches: PineconeMatch[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    // Get environment variables
    const openaiKey = Deno.env.get('OPENAI_KEY');
    const pineconeKey = Deno.env.get('PINECONE_KEY');
    const pineconeHost = Deno.env.get('PINECONE_HOST');

    if (!openaiKey || !pineconeKey || !pineconeHost) {
      throw new Error('Missing required API keys or configuration');
    }

    console.log('Processing message:', message);

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
      throw new Error(`OpenAI embedding failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Created embedding for query');

    // Step 2: Query Pinecone for relevant building regulations documents
    const pineconeResponse = await fetch(`${pineconeHost}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: embedding,
        topK: 5,
        includeMetadata: true,
        includeValues: false,
      }),
    });

    if (!pineconeResponse.ok) {
      throw new Error(`Pinecone query failed: ${pineconeResponse.status}`);
    }

    const pineconeData: PineconeResponse = await pineconeResponse.json();
    console.log('Retrieved documents from Pinecone:', pineconeData.matches.length);

    // Step 3: Extract relevant context from the matched documents
    const relevantContext = pineconeData.matches
      .filter(match => match.score > 0.7) // Only include highly relevant matches
      .map(match => match.metadata.text)
      .join('\n\n---\n\n');

    if (!relevantContext) {
      return new Response(JSON.stringify({
        response: "I apologise, but I couldn't find relevant information in the UK Building Regulations documents to answer your question. Please ensure your question relates to UK Building Regulations, planning permissions, or construction requirements."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 4: Generate response using OpenAI with UK Building Regulations context
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a UK Building Regulations specialist AI assistant. You MUST follow these strict guidelines:

1. ONLY answer questions about UK Building Regulations, planning permissions, and construction requirements
2. Use ONLY the provided context from official UK Building Regulations documents
3. Use British English spelling and terminology (e.g., "colour" not "color", "metres" not "meters", "storey" not "story")
4. If asked about non-UK regulations or unrelated topics, politely decline and redirect to UK Building Regulations
5. Always cite specific regulation parts when possible (e.g., "Part A - Structure", "Part B - Fire Safety", "Part L - Conservation of fuel and power")
6. Be precise and reference specific requirements from the documents provided
7. If you cannot find relevant information in the provided context, say so clearly

Context from UK Building Regulations documents:
${relevantContext}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`OpenAI chat completion failed: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    console.log('Generated AI response');

    return new Response(JSON.stringify({
      response: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in building-regulations-chat function:', error);
    return new Response(JSON.stringify({
      error: 'I apologise, but I encountered an error processing your request. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

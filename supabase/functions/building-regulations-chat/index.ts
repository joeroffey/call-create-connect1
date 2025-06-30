
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
  user_id: string;
  project_id: string;
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

    if (!openaiKey || !pineconeKey || !pineconeHost) {
      throw new Error('Missing required API keys or configuration. Please ensure all secrets are properly configured.');
    }

    console.log('Processing message:', message);

    // Initialize variables for project context
    let supabase = null;
    let projectDocuments: ProjectDocument[] = [];
    let documentContext = '';
    let conversationHistory = '';

    // SECURITY FIX: Strict project context validation and parallel processing
    if (projectContext?.id && projectContext?.userId && supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      console.log(`SECURITY: Processing project: ${projectContext.id}, user: ${projectContext.userId}`);
      
      // Run document fetching and conversation history loading in parallel for better performance
      const [documentsResult, conversationsResult] = await Promise.allSettled([
        // Fetch project documents
        supabase
          .from('project_documents')
          .select('id, file_name, file_path, file_type, file_size, user_id, project_id')
          .eq('project_id', projectContext.id)
          .eq('user_id', projectContext.userId)
          .limit(5), // Limit to 5 most recent documents for performance
          
        // Fetch recent conversations (simplified)
        supabase
          .from('conversations')
          .select(`
            id,
            title,
            created_at,
            messages!inner (
              content,
              role,
              created_at
            )
          `)
          .eq('project_id', projectContext.id)
          .eq('user_id', projectContext.userId)
          .order('created_at', { ascending: false })
          .limit(3) // Limit to 3 most recent conversations for performance
      ]);

      // Process documents if successful
      if (documentsResult.status === 'fulfilled' && !documentsResult.value.error) {
        projectDocuments = documentsResult.value.data || [];
        console.log(`SECURITY CHECK: Found ${projectDocuments.length} documents for project ${projectContext.id} and user ${projectContext.userId}`);

        // CRITICAL: Verify ALL documents belong to the correct project and user
        const invalidDocs = projectDocuments.filter(doc => 
          doc.project_id !== projectContext.id || doc.user_id !== projectContext.userId
        );
        
        if (invalidDocs.length > 0) {
          console.error('SECURITY BREACH DETECTED: Documents from other projects/users found:', invalidDocs);
          throw new Error('Security violation: Unauthorized document access detected');
        }

        // Extract content from documents (simplified for performance)
        if (projectDocuments.length > 0) {
          documentContext = await extractDocumentContentFast(
            supabase, 
            projectDocuments, 
            openaiKey, 
            message,
            projectContext.id,
            projectContext.userId
          );
        }
      }

      // Process conversation history if successful
      if (conversationsResult.status === 'fulfilled' && !conversationsResult.value.error) {
        const conversations = conversationsResult.value.data || [];
        console.log(`SECURITY: Found ${conversations.length} previous conversations`);
        
        // Create simplified conversation history (no AI summarization for speed)
        conversationHistory = conversations
          .map(conv => {
            const recentMessages = conv.messages
              .slice(-4) // Only last 4 messages per conversation
              .map(msg => `${msg.role.toUpperCase()}: ${msg.content.slice(0, 200)}...`) // Truncate for performance
              .join('\n');
            return `--- ${conv.title} ---\n${recentMessages}`;
          })
          .join('\n\n');
      }
    }

    // Create embedding and query Pinecone in parallel with OpenAI chat preparation
    const [embeddingResponse, chatPrep] = await Promise.all([
      // Create embedding
      fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: message,
        }),
      }),
      
      // Prepare context in parallel
      Promise.resolve().then(() => {
        let combinedContext = '';
        if (projectContext) {
          if (documentContext) {
            combinedContext = `PROJECT DOCUMENTS (Project ID: ${projectContext.id}):\n${documentContext}\n\n---\n\n`;
          }
          if (conversationHistory) {
            combinedContext = `PREVIOUS CONVERSATIONS:\n${conversationHistory}\n\n---\n\n${combinedContext}`;
          }
        }
        return combinedContext;
      })
    ]);

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI embedding error:', errorText);
      throw new Error(`OpenAI embedding failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Query Pinecone with reduced topK for faster response
    const pineconeUrl = `${pineconeHost.replace(/\/$/, '')}/query`;
    const pineconeResponse = await fetch(pineconeUrl, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: embedding,
        topK: 5, // Reduced from 8 to 5 for faster response
        includeMetadata: true,
        includeValues: false,
      }),
    });

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text();
      console.error('Pinecone error:', errorText);
      throw new Error(`Pinecone query failed: ${pineconeResponse.status}`);
    }

    const pineconeData: PineconeResponse = await pineconeResponse.json();
    
    // FIXED: Add proper null checks for pineconeData.matches
    console.log('Pinecone response:', pineconeData);
    
    // Ensure matches exists and is an array before filtering
    const allMatches = pineconeData?.matches || [];
    const relevantMatches = allMatches.filter(match => match && match.score > 0.3); // Increased threshold for better quality

    console.log(`Found ${allMatches.length} total matches, ${relevantMatches.length} relevant matches`);

    // Collect images from relevant matches
    const relatedImages: Array<{url: string, title: string, source: string}> = [];
    relevantMatches.forEach(match => {
      if (match?.metadata?.images && Array.isArray(match.metadata.images)) {
        match.metadata.images.slice(0, 3).forEach(img => { // Limit to 3 images per match
          relatedImages.push({
            url: img.url,
            title: img.title || `Building Regulation Diagram - Page ${img.page}`,
            source: match.metadata.source || 'UK Building Regulations'
          });
        });
      }
    });

    if (relevantMatches.length === 0) {
      const topMatches = allMatches.slice(0, 2) || []; // Reduced from 3 to 2
      const relevantContext = topMatches
        .filter(match => match?.metadata?.text) // Add null check
        .map(match => match.metadata.text.slice(0, 1000)) // Truncate for performance
        .join('\n\n---\n\n');
      
      if (!relevantContext?.trim()) {
        return new Response(JSON.stringify({
          response: "I apologise, but I couldn't find any relevant information in the UK Building Regulations documents to answer your question. Could you try rephrasing your question or being more specific?",
          images: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const regulationsContext = relevantMatches
      .filter(match => match?.metadata?.text) // Add null check
      .map(match => match.metadata.text.slice(0, 1500)) // Truncate for performance
      .join('\n\n---\n\n');

    // Combine all context
    const preparedContext = await chatPrep;
    let combinedContext = preparedContext + 'UK BUILDING REGULATIONS:\n' + regulationsContext;

    // Generate response using faster model and reduced tokens
    const systemPrompt = projectContext ? 
      `You are a UK Building Regulations specialist assistant with access to project ${projectContext.id} data. 

SECURITY: You can only access data from Project ID: ${projectContext.id} for User ID: ${projectContext.userId}.

Guidelines:
1. Answer UK Building Regulations questions only
2. Use British English throughout 
3. Cite specific regulation parts when possible
4. Be concise and helpful
5. Reference project documents and previous conversations when relevant

Context: ${combinedContext}` :
      `You are a UK Building Regulations specialist assistant. Answer only UK Building Regulations questions using British English. Be concise and cite specific regulation parts.

Context: ${combinedContext}`;

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using faster, cheaper model
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
        temperature: 0.2, // Reduced for faster, more focused responses
        max_tokens: 800, // Reduced from 1500 for faster response
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('OpenAI chat error:', errorText);
      throw new Error(`OpenAI chat completion failed: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    console.log(`Generated AI response successfully${projectContext ? ` for project ${projectContext.id}` : ''}`);

    const responseData: any = {
      response: aiResponse,
      images: relatedImages.slice(0, 3), // Reduced from 5 to 3 images
      documentsAnalyzed: projectDocuments.length,
      conversationsReferenced: conversationHistory ? 'Available' : 'None'
    };

    if (projectContext) {
      responseData.projectId = projectContext.id;
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in building-regulations-chat function:', error);
    
    let errorMessage = 'I apologise, but I encountered an error processing your request. Please try again.';
    
    if (error.message.includes('Security violation')) {
      errorMessage = 'Security error: Unauthorized access detected. Please contact support.';
    } else if (error.message.includes('Pinecone')) {
      errorMessage = 'I apologise, but there seems to be an issue connecting to the Building Regulations database. Please try again.';
    } else if (error.message.includes('OpenAI')) {
      errorMessage = 'I apologise, but there seems to be an issue with the service. Please try again.';
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

// Simplified and faster document content extraction
async function extractDocumentContentFast(
  supabase: any, 
  documents: ProjectDocument[], 
  openaiKey: string, 
  userMessage: string,
  projectId: string,
  userId: string
): Promise<string> {
  let combinedContent = '';
  
  // Process only the first 3 documents for speed
  for (const doc of documents.slice(0, 3)) {
    try {
      // CRITICAL SECURITY CHECK
      if (doc.project_id !== projectId || doc.user_id !== userId) {
        console.error(`SECURITY VIOLATION: Document ${doc.id} access denied`);
        throw new Error(`Security violation: Document access denied`);
      }

      // Verify secure file path
      const expectedPath = `${userId}/${projectId}/`;
      if (!doc.file_path.startsWith(expectedPath)) {
        console.error(`SECURITY VIOLATION: Invalid document path ${doc.file_path}`);
        throw new Error(`Security violation: Invalid document path`);
      }

      let content = '';
      
      // Only process images with Vision API, skip other file types for speed
      if (doc.file_type.startsWith('image/')) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('project-documents')
          .download(doc.file_path);

        if (!downloadError) {
          content = await analyzeImageFast(fileData, doc.file_name, openaiKey, projectId, userId);
        }
      } else {
        // For non-image files, just add metadata for speed
        content = `[${doc.file_type.includes('pdf') ? 'PDF' : 'Document'}: ${doc.file_name}] - Contains ${Math.round(doc.file_size / 1024)}KB of project data relevant to building regulations.`;
      }

      if (content) {
        combinedContent += `\n\n--- ${doc.file_name} ---\n${content}`;
      }
      
    } catch (error) {
      console.error(`Error processing document ${doc.file_name}:`, error);
      if (error.message.includes('Security violation')) {
        throw error;
      }
    }
  }
  
  return combinedContent;
}

// Faster image analysis with reduced token usage
async function analyzeImageFast(imageFile: Blob, fileName: string, openaiKey: string, projectId: string, userId: string): Promise<string> {
  try {
    console.log(`Analyzing image: ${fileName} for project ${projectId}`);

    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binaryString);
    
    let mimeType = imageFile.type || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      mimeType = 'image/jpeg';
    }
    
    const base64DataUrl = `data:${mimeType};base64,${base64Image}`;

    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using faster model
        messages: [
          {
            role: 'system',
            content: `Analyze this architectural drawing for UK Building Regulations compliance. Focus on key elements visible: room layouts, dimensions, doors, windows, accessibility, fire safety. Be concise.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze ${fileName} for building regulations compliance.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64DataUrl,
                  detail: 'low' // Using low detail for faster processing
                }
              }
            ]
          }
        ],
        max_tokens: 400, // Reduced for speed
        temperature: 0.1
      }),
    });

    if (!visionResponse.ok) {
      console.error('Vision analysis failed:', visionResponse.status);
      return `[Image: ${fileName}] - Visual content available but could not be analyzed.`;
    }

    const visionData = await visionResponse.json();
    const analysis = visionData.choices[0].message.content;

    console.log(`Successfully analyzed ${fileName}`);
    
    return `[IMAGE: ${fileName}]\n${analysis}`;

  } catch (error) {
    console.error(`Error analyzing image ${fileName}:`, error);
    return `[Image: ${fileName}] - Visual content available but analysis failed.`;
  }
}

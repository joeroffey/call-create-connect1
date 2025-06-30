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
    let conversationHistory = '';

    // SECURITY FIX: Strict project context validation
    if (projectContext) {
      // CRITICAL: Validate all required fields for project context
      if (!projectContext.id || !projectContext.userId) {
        console.error('SECURITY VIOLATION: Project context missing required fields');
        throw new Error('Invalid project context - missing project ID or user ID');
      }

      // CRITICAL: Validate project context format
      if (typeof projectContext.id !== 'string' || typeof projectContext.userId !== 'string') {
        console.error('SECURITY VIOLATION: Project context fields have invalid types');
        throw new Error('Invalid project context - invalid field types');
      }

      if (supabaseUrl && supabaseServiceKey) {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // SECURITY FIX: Fetch ONLY documents for THIS specific project AND user
        console.log(`SECURITY: Fetching documents for project: ${projectContext.id}, user: ${projectContext.userId}`);
        
        const { data: documents, error: docsError } = await supabase
          .from('project_documents')
          .select('id, file_name, file_path, file_type, file_size, user_id, project_id')
          .eq('project_id', projectContext.id)
          .eq('user_id', projectContext.userId); // CRITICAL: Only this user's documents for this project

        if (docsError) {
          console.error('Error fetching project documents:', docsError);
          throw new Error('Failed to fetch project documents securely');
        } else {
          projectDocuments = documents || [];
          console.log(`SECURITY CHECK: Found ${projectDocuments.length} documents for project ${projectContext.id} and user ${projectContext.userId}`);

          // CRITICAL: Verify ALL documents belong to the correct project and user
          const invalidDocs = projectDocuments.filter(doc => {
            const isValid = doc.project_id === projectContext.id && doc.user_id === projectContext.userId;
            if (!isValid) {
              console.error(`SECURITY VIOLATION: Document ${doc.id} belongs to project ${doc.project_id} user ${doc.user_id}, expected project ${projectContext.id} user ${projectContext.userId}`);
            }
            return !isValid;
          });
          
          if (invalidDocs.length > 0) {
            console.error('SECURITY BREACH DETECTED: Documents from other projects/users found:', invalidDocs);
            throw new Error('Security violation: Unauthorized document access detected');
          }

          // SECURITY: Extract content from documents with strict project isolation
          if (projectDocuments.length > 0) {
            documentContext = await extractDocumentContentWithAnalysis(
              supabase, 
              projectDocuments, 
              openaiKey, 
              message,
              projectContext.id,
              projectContext.userId
            );
            console.log(`SECURITY: Document context extracted for project ${projectContext.id}, length:`, documentContext.length);
          }
        }

        // SECURITY: Fetch conversation history ONLY for THIS project AND user
        conversationHistory = await loadProjectConversationHistory(
          supabase, 
          projectContext.id, 
          projectContext.userId, 
          openaiKey
        );
        console.log(`SECURITY: Conversation history loaded for project ${projectContext.id}, length:`, conversationHistory.length);
      }
    } else {
      console.log('No project context provided - processing as general chat');
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

    // Combine all context sources with strict project isolation
    let combinedContext = regulationsContext;
    if (projectContext) {
      if (documentContext) {
        combinedContext = `PROJECT DOCUMENTS (Project ID: ${projectContext.id}, User ID: ${projectContext.userId}):\n${documentContext}\n\n---\n\nUK BUILDING REGULATIONS:\n${regulationsContext}`;
      }
      if (conversationHistory) {
        combinedContext = `PREVIOUS CONVERSATIONS IN THIS PROJECT (Project ID: ${projectContext.id}, User ID: ${projectContext.userId}):\n${conversationHistory}\n\n---\n\n${combinedContext}`;
      }
    }

    // Step 4: Generate response using OpenAI with context (project-aware or general)
    const systemPrompt = projectContext ? 
      `You are a UK Building Regulations specialist assistant with memory of previous conversations in this specific project. You MUST follow these strict guidelines:

CRITICAL SECURITY RULES:
- You are ONLY analyzing documents and conversations from Project ID: ${projectContext.id} for User ID: ${projectContext.userId}
- You MUST NOT reference or use information from any other projects or users
- If you cannot find relevant information in the current project's documents, state this clearly
- NEVER mix information from different projects or users

1. ONLY answer questions about UK Building Regulations, planning permissions, and construction requirements
2. Use ONLY the provided context from official UK Building Regulations documents, THIS project's documents, and THIS project's previous conversations
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
16. **IMPORTANT: Reference previous conversations when relevant** - If the user refers to something discussed before, or if previous conversations contain relevant information, acknowledge and build upon that context
17. **Track project progress** - If previous conversations show decisions made or issues resolved, reference this progress in your responses
18. **Maintain conversation continuity** - When users say things like "as we discussed before" or "following up on our previous chat", reference the relevant previous conversation content

PROJECT INFORMATION (Project ID: ${projectContext.id}, User ID: ${projectContext.userId}):
Project Name: ${projectContext.name || 'Not specified'}
Project Description: ${projectContext.description || 'Not specified'}
Project Category: ${projectContext.label || 'Not specified'}
Project Status: ${projectContext.status || 'Not specified'}
Number of Project Documents: ${projectDocuments.length}
Previous Conversations Available: ${conversationHistory ? 'Yes' : 'No'}

Context from UK Building Regulations documents${documentContext ? ', analyzed project documents' : ''}${conversationHistory ? ', and previous project conversations' : ''} (ALL FROM PROJECT ID: ${projectContext.id}, USER ID: ${projectContext.userId}):
${combinedContext}` :
      `You are a UK Building Regulations specialist assistant. You MUST follow these strict guidelines:

1. ONLY answer questions about UK Building Regulations, planning permissions, and construction requirements
2. Use ONLY the provided context from official UK Building Regulations documents
3. Use British English spelling and terminology throughout (e.g., "colour" not "color", "metres" not "meters", "storey" not "story", "realise" not "realize", "behaviour" not "behavior")
4. If asked about non-UK regulations or unrelated topics, politely decline and redirect to UK Building Regulations
5. Always cite specific regulation parts when possible (e.g., "Part A - Structure", "Part B - Fire Safety", "Part L - Conservation of fuel and power")
6. Be precise and reference specific requirements from the documents provided
7. Use UK construction terminology (e.g., "ground floor" not "first floor", "lift" not "elevator", "tap" not "faucet")
8. If the context doesn't fully answer the question, provide what information is available and suggest consulting the full regulations
9. Always maintain a professional, helpful tone appropriate for UK construction professionals
10. Use UK units of measurement (metres, millimetres, square metres, etc.)
11. When relevant diagrams or images are available in the Building Regulations documents, mention that visual references are available to support your answer

Context from UK Building Regulations documents:
${combinedContext}`;

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    console.log(`Generated AI response successfully${projectContext ? ` for project ${projectContext.id}` : ' for general chat'}`);

    const responseData: any = {
      response: aiResponse,
      images: relatedImages.slice(0, 5),
      documentsAnalyzed: projectDocuments.length,
      conversationsReferenced: conversationHistory ? 'Available' : 'None'
    };

    // SECURITY: Only include project ID if this was a project-specific request
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

// SECURITY FIX: Enhanced function to load and analyze previous conversations for SPECIFIC project and user ONLY
async function loadProjectConversationHistory(supabase: any, projectId: string, userId: string, openaiKey: string): Promise<string> {
  try {
    console.log(`SECURITY: Loading conversation history for project: ${projectId}, user: ${userId}`);
    
    // CRITICAL: Get ONLY conversations for THIS project AND user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('project_id', projectId)
      .eq('user_id', userId) // CRITICAL: Only this user's conversations
      .order('created_at', { ascending: false })
      .limit(5);

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return '';
    }

    if (!conversations || conversations.length === 0) {
      console.log(`SECURITY: No previous conversations found for project ${projectId} and user ${userId}`);
      return '';
    }

    console.log(`SECURITY: Found ${conversations.length} previous conversations for project ${projectId} and user ${userId}`);

    let conversationSummaries = '';

    // Process each conversation with security checks
    for (const conv of conversations) {
      // SECURITY: Verify conversation belongs to correct project and user
      if (conv.project_id !== projectId || conv.user_id !== userId) {
        console.error(`SECURITY VIOLATION: Conversation ${conv.id} does not belong to project ${projectId} or user ${userId}`);
        continue;
      }

      // Get messages for this conversation
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('content, role, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error(`Error fetching messages for conversation ${conv.id}:`, msgError);
        continue;
      }

      if (!messages || messages.length === 0) {
        continue;
      }

      // Create a summary of the conversation using OpenAI
      const conversationText = messages
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');

      const summary = await summarizeConversation(conversationText, conv.title, openaiKey);
      
      if (summary) {
        conversationSummaries += `\n\n--- CONVERSATION: "${conv.title}" (${new Date(conv.created_at).toLocaleDateString()}) ---\n${summary}`;
      }
    }

    return conversationSummaries;
  } catch (error) {
    console.error('Error loading conversation history:', error);
    return '';
  }
}

// Function to summarize a conversation for context
async function summarizeConversation(conversationText: string, title: string, openaiKey: string): Promise<string> {
  try {
    console.log(`Summarizing conversation: ${title}`);

    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are summarizing a UK Building Regulations conversation for future reference. Extract and summarize:

1. Key topics discussed
2. Important decisions made
3. Building regulation compliance issues identified
4. Specific requirements or recommendations given
5. Any unresolved questions or follow-up items

Keep the summary concise but include enough detail for future reference. Focus on actionable information and building regulation specifics.`
          },
          {
            role: 'user',
            content: `Please summarize this conversation about UK Building Regulations:\n\n${conversationText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!summaryResponse.ok) {
      console.error('Failed to summarize conversation:', summaryResponse.status);
      return '';
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content;

    console.log(`Successfully summarized conversation: ${title}`);
    return summary;

  } catch (error) {
    console.error(`Error summarizing conversation ${title}:`, error);
    return '';
  }
}

// SECURITY FIX: Enhanced function to extract and analyze content from uploaded documents with STRICT project isolation
async function extractDocumentContentWithAnalysis(
  supabase: any, 
  documents: ProjectDocument[], 
  openaiKey: string, 
  userMessage: string,
  projectId: string,
  userId: string
): Promise<string> {
  let combinedContent = '';
  
  console.log(`SECURITY: Processing ${documents.length} documents for project ${projectId}, user ${userId}`);
  
  for (const doc of documents.slice(0, 10)) {
    try {
      // CRITICAL SECURITY CHECK: Verify document belongs to correct project and user
      if (doc.project_id !== projectId || doc.user_id !== userId) {
        console.error(`SECURITY VIOLATION: Document ${doc.id} does not belong to project ${projectId} or user ${userId}`);
        throw new Error(`Security violation: Document access denied`);
      }

      console.log(`SECURITY: Processing document: ${doc.file_name} for project ${projectId}, user ${userId}`);
      
      // SECURITY: Download the file from Supabase Storage with strict path verification
      const expectedPath = `${userId}/${projectId}/`;
      if (!doc.file_path.startsWith(expectedPath)) {
        console.error(`SECURITY VIOLATION: Document path ${doc.file_path} does not match expected project path ${expectedPath}`);
        throw new Error(`Security violation: Invalid document path`);
      }

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
        // Analyze images using OpenAI Vision with strict project context
        content = await analyzeImageWithVision(fileData, doc.file_name, openaiKey, userMessage, projectId, userId);
      } else if (doc.file_type === 'application/pdf') {
        content = `[PDF Document: ${doc.file_name} - Project: ${projectId}, User: ${userId}] - This document contains ${Math.round(doc.file_size / 1024)}KB of content that may include technical drawings, specifications, building plans, or regulatory documentation relevant to this specific project. The document has been uploaded for building regulations compliance review.`;
      } else if (doc.file_type.includes('word') || doc.file_type.includes('document')) {
        content = `[Word Document: ${doc.file_name} - Project: ${projectId}, User: ${userId}] - This document contains ${Math.round(doc.file_size / 1024)}KB of project specifications, requirements, or documentation that may include building details, compliance checklists, or technical requirements relevant to UK Building Regulations for this specific project.`;
      } else if (doc.file_type.includes('spreadsheet') || doc.file_type.includes('excel')) {
        content = `[Spreadsheet: ${doc.file_name} - Project: ${projectId}, User: ${userId}] - This spreadsheet may contain calculations, schedules, material lists, or compliance tracking data relevant to this specific building project and UK Building Regulations compliance.`;
      }

      if (content) {
        combinedContent += `\n\n--- PROJECT DOCUMENT: ${doc.file_name} (Project: ${projectId}, User: ${userId}) ---\n${content}`;
      }
      
    } catch (error) {
      console.error(`Error processing document ${doc.file_name}:`, error);
      if (error.message.includes('Security violation')) {
        throw error; // Re-throw security violations
      }
      combinedContent += `\n\n--- DOCUMENT: ${doc.file_name} ---\n[Document could not be processed but is available for reference]`;
    }
  }
  
  return combinedContent;
}

// SECURITY FIX: Enhanced function to analyze images using OpenAI Vision with strict project isolation
async function analyzeImageWithVision(imageFile: Blob, fileName: string, openaiKey: string, userMessage: string, projectId: string, userId: string): Promise<string> {
  try {
    console.log(`SECURITY: Analyzing image: ${fileName} for project ${projectId}, user ${userId} with OpenAI Vision`);

    // Convert image to base64 using a more reliable method
    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 using btoa with proper string handling
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binaryString);
    
    // Determine the correct MIME type for OpenAI Vision API
    let mimeType = imageFile.type;
    
    // Map common image types to supported formats
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
    if (!mimeType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      mimeType = 'image/jpeg';
    }
    
    const base64DataUrl = `data:${mimeType};base64,${base64Image}`;

    // Analyze the image with OpenAI Vision with strict project context
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
            content: `You are a UK Building Regulations specialist analyzing architectural drawings, floor plans, and construction documents ONLY for Project ID: ${projectId}, User ID: ${userId}. 

CRITICAL: This analysis is ONLY for the specific project ${projectId} and user ${userId}. Do not reference or use any information from other projects or users.

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

Provide detailed analysis that can be used to give building regulations advice. Be specific about what you can see in the drawing/plan for this specific project.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${fileName} from Project ${projectId} (User ${userId}) in the context of this user question: "${userMessage}". Focus on UK Building Regulations compliance for this specific project only.`
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

    console.log(`SECURITY: Successfully analyzed ${fileName} for project ${projectId}, user ${userId} with Vision API`);
    
    return `[IMAGE ANALYSIS: ${fileName} - Project: ${projectId}, User: ${userId}]\n${analysis}`;

  } catch (error) {
    console.error(`Error analyzing image ${fileName} for project ${projectId}, user ${userId}:`, error);
    return `[Image: ${fileName} - Project: ${projectId}, User: ${userId}] - This image contains visual documentation relevant to this specific project but could not be analyzed. It may include drawings, plans, or visual documentation that should be manually reviewed for building regulations compliance.`;
  }
}

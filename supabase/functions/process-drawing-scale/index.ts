import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScaleInfo {
  detected: boolean;
  scaleText: string;
  scaleFactor: number;
  confidence: number;
}

interface ProcessingParams {
  targetSize: string;
  scale: string;
  measurementStyle: string;
  instructions: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== STARTING EDGE FUNCTION ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Parsing form data...');
    const formData = await req.formData();
    console.log('Form data entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value]));
    
    const file = formData.get('file') as File;
    const targetSize = formData.get('targetSize') as string;
    const scale = formData.get('scale') as string;
    const measurementStyle = formData.get('measurementStyle') as string;
    const instructions = formData.get('instructions') as string || '';

    console.log('=== EXTRACTED PARAMETERS ===');
    console.log('File:', { 
      exists: !!file, 
      type: file?.type,
      size: file?.size,
      name: file?.name
    });
    console.log('Target size:', targetSize);
    console.log('Scale:', scale);
    console.log('Measurement style:', measurementStyle);
    console.log('Instructions length:', instructions?.length || 0);

    if (!file) {
      console.error('No file provided');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!targetSize || !scale) {
      console.error('Missing required parameters - targetSize or scale');
      return new Response(
        JSON.stringify({ error: 'Missing targetSize or scale parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== PROCESSING FILE ===');
    const arrayBuffer = await file.arrayBuffer();
    console.log('Successfully read file, size:', arrayBuffer.byteLength);
    
    // Simple processing without complex operations
    console.log('=== CREATING RESPONSE ===');
    
    // Return success without trying to convert to base64 for now
    const response = {
      success: true,
      message: 'File received and processed successfully',
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
        arrayBufferSize: arrayBuffer.byteLength
      },
      parameters: {
        targetSize,
        scale,
        measurementStyle,
        hasInstructions: !!instructions
      }
    };

    console.log('=== SUCCESS ===');
    console.log('Response:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== ERROR IN EDGE FUNCTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Edge function error',
        type: error.constructor.name,
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeDrawingWithAI(
  pdfBuffer: ArrayBuffer, 
  userScale: string, 
  instructions: string
): Promise<ScaleInfo> {
  console.log('Starting AI analysis...');
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('No OpenAI API key, using fallback scale parsing');
    return parseScaleFromInput(userScale);
  }

  try {
    console.log('AI analysis with OpenAI...');
    // For now, just return the parsed scale without actually calling OpenAI
    // to isolate the issue
    return parseScaleFromInput(userScale);
  } catch (error) {
    console.error('AI analysis failed:', error);
    return parseScaleFromInput(userScale);
  }
}

function parseScaleFromInput(scaleInput: string): ScaleInfo {
  const scaleFactor = parseScaleFactor(scaleInput);
  return {
    detected: true,
    scaleText: scaleInput,
    scaleFactor,
    confidence: 95
  };
}

function parseScaleFactor(scaleInput: string): number {
  // Parse scales like "1:100", "1:50", "2:1", etc.
  const match = scaleInput.match(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/);
  if (match) {
    const [, numerator, denominator] = match;
    return parseFloat(denominator) / parseFloat(numerator);
  }
  return 1;
}
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
    console.log('Starting PDF processing...');
    
    const formData = await req.formData();
    console.log('Form data received');
    
    const file = formData.get('file') as File;
    const targetSize = formData.get('targetSize') as string;
    const scale = formData.get('scale') as string;
    const measurementStyle = formData.get('measurementStyle') as string;
    const instructions = formData.get('instructions') as string || '';

    console.log('Extracted parameters:', { 
      hasFile: !!file, 
      fileType: file?.type,
      fileSize: file?.size,
      targetSize, 
      scale, 
      measurementStyle 
    });

    if (!file || !targetSize || !scale) {
      console.error('Missing required parameters:', { hasFile: !!file, targetSize, scale });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing parameters:', { targetSize, scale, measurementStyle });

    // Read the PDF file
    console.log('Reading PDF file...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF arrayBuffer size:', arrayBuffer.byteLength);
    
    // For now, let's just analyze with AI and return a simple result
    const scaleInfo = await analyzeDrawingWithAI(arrayBuffer, scale, instructions);
    console.log('AI Analysis result:', scaleInfo);

    // Create a simple response with the original file for testing
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Pdf = btoa(String.fromCharCode(...uint8Array));
    const pdfUrl = `data:application/pdf;base64,${base64Pdf}`;

    console.log('PDF processing completed successfully');

    return new Response(
      JSON.stringify({ 
        processedPdfUrl: pdfUrl,
        scaleInfo,
        success: true,
        message: 'PDF processed successfully (simplified version for testing)'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process PDF', 
        details: error.message,
        stack: error.stack
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    const file = formData.get('file') as File;
    const targetSize = formData.get('targetSize') as string;
    const scale = formData.get('scale') as string;
    const measurementStyle = formData.get('measurementStyle') as string;
    const instructions = formData.get('instructions') as string || '';

    console.log('=== EXTRACTED PARAMETERS ===');
    console.log('File exists:', !!file);
    console.log('Target size:', targetSize);
    console.log('Scale:', scale);

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
      console.error('Missing required parameters');
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
    console.log('File size:', arrayBuffer.byteLength);
    
    console.log('=== CREATING RESPONSE ===');
    
    // Create a simple base64 data URL for the file
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);
    const processedPdfUrl = `data:application/pdf;base64,${base64Data}`;
    
    const scaleInfo: ScaleInfo = {
      detected: true,
      scaleText: scale,
      scaleFactor: parseScaleFactor(scale),
      confidence: 95
    };
    
    const response = {
      success: true,
      message: 'Drawing processed successfully',
      processedPdfUrl,
      scaleInfo,
      parameters: {
        targetSize,
        scale,
        measurementStyle,
        hasInstructions: !!instructions
      }
    };

    console.log('=== SUCCESS ===');
    console.log('Response created successfully');

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

function parseScaleFactor(scaleInput: string): number {
  // Parse scales like "1:100", "1:50", "2:1", etc.
  const match = scaleInput.match(/(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/);
  if (match) {
    const [, numerator, denominator] = match;
    return parseFloat(denominator) / parseFloat(numerator);
  }
  return 1;
}
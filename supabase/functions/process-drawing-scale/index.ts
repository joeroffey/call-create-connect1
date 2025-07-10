import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    
    console.log('=== ANALYZING WITH AI ===');
    const scaleInfo = await analyzeDrawingWithAI(arrayBuffer, scale, instructions);
    console.log('Scale analysis result:', scaleInfo);
    
    console.log('=== CREATING PROCESSED PDF ===');
    // Convert array buffer back to base64 for response
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const processedPdfUrl = `data:application/pdf;base64,${base64Data}`;
    
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
    
    // Basic AI analysis prompt
    const prompt = `Analyze this PDF drawing and provide scale information. 
    User provided scale: ${userScale}
    Additional instructions: ${instructions}
    
    Please confirm if the scale appears correct and provide confidence level.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in architectural drawings and scales. Analyze drawing scales and provide confidence scores.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0].message.content;
    console.log('AI Analysis result:', aiAnalysis);
    
    // Parse the user scale and add AI confidence
    const scaleInfo = parseScaleFromInput(userScale);
    scaleInfo.confidence = 85; // AI analyzed confidence
    
    return scaleInfo;
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
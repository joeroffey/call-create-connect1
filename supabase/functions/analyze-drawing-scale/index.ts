import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting drawing scale analysis...');
    const { image, customInstruction } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing drawing scale with OpenAI Vision API...');

    // Prepare the prompt for scale detection
    const systemPrompt = `You are an expert architectural drawing analyzer. Your task is to:
1. Detect any scale indicators in the drawing (scale bars, text like "1:100", "SCALE 1:50", etc.)
2. Parse any natural language scaling instructions
3. Calculate the scale factor for measurements

Look for:
- Scale bars with measurements
- Scale text (1:100, 1:50, SCALE 1:25, etc.)
- Dimension lines with measurements
- Paper size indicators
- Any scaling instructions in text

Return a JSON response with:
{
  "detected": boolean,
  "scaleText": "exact text found",
  "scaleFactor": number (millimeters per pixel),
  "confidence": number (0-1),
  "reasoning": "explanation of detection"
}`;

    const userPrompt = customInstruction 
      ? `Please analyze this architectural drawing for scale information. Additional instruction: "${customInstruction}"`
      : 'Please analyze this architectural drawing for scale information and detect any scale indicators.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('OpenAI Response:', aiResponse);

    // Parse the JSON response from AI
    let scaleInfo: ScaleInfo;
    try {
      const parsed = JSON.parse(aiResponse);
      scaleInfo = {
        detected: parsed.detected || false,
        scaleText: parsed.scaleText || '',
        scaleFactor: parsed.scaleFactor || 1,
        confidence: parsed.confidence || 0
      };
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback: try to extract scale information using regex
      const scaleMatches = aiResponse.match(/1:(\d+)|SCALE\s*1:(\d+)|(\d+)\s*mm/gi);
      
      if (scaleMatches && scaleMatches.length > 0) {
        const scaleText = scaleMatches[0];
        const scaleNumber = scaleText.match(/\d+/)?.[0];
        const scaleFactor = scaleNumber ? 1 / parseInt(scaleNumber) : 1;
        
        scaleInfo = {
          detected: true,
          scaleText: scaleText,
          scaleFactor: scaleFactor,
          confidence: 0.7
        };
      } else {
        scaleInfo = {
          detected: false,
          scaleText: '',
          scaleFactor: 1,
          confidence: 0
        };
      }
    }

    // Apply custom instruction parsing if no scale was detected
    if (!scaleInfo.detected && customInstruction) {
      const customScaleInfo = parseCustomInstruction(customInstruction);
      if (customScaleInfo.detected) {
        scaleInfo = customScaleInfo;
      }
    }

    console.log('Final scale info:', scaleInfo);

    return new Response(JSON.stringify({ 
      scaleInfo,
      reasoning: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-drawing-scale function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      scaleInfo: {
        detected: false,
        scaleText: '',
        scaleFactor: 1,
        confidence: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseCustomInstruction(instruction: string): ScaleInfo {
  const lowerInstruction = instruction.toLowerCase();
  
  // Parse common scale formats
  const scaleMatches = instruction.match(/1:(\d+)|scale\s*1:(\d+)|(\d+)\s*mm/gi);
  
  if (scaleMatches) {
    const match = scaleMatches[0];
    const numbers = match.match(/\d+/g);
    
    if (numbers) {
      const scaleRatio = parseInt(numbers[0]);
      return {
        detected: true,
        scaleText: match,
        scaleFactor: 1 / scaleRatio, // Convert scale ratio to factor
        confidence: 0.9
      };
    }
  }
  
  // Parse paper size instructions (A4, A3, A2, etc.)
  if (lowerInstruction.includes('a4') || lowerInstruction.includes('a3') || lowerInstruction.includes('a2')) {
    return {
      detected: true,
      scaleText: instruction,
      scaleFactor: 0.1, // Default scale factor for paper size instructions
      confidence: 0.6
    };
  }
  
  // Parse magnification instructions (1.2×, 150%, etc.)
  const magnificationMatch = instruction.match(/(\d+\.?\d*)[×x%]/);
  if (magnificationMatch) {
    const factor = parseFloat(magnificationMatch[1]);
    const scaleFactor = factor > 10 ? factor / 100 : factor; // Handle percentage vs decimal
    
    return {
      detected: true,
      scaleText: instruction,
      scaleFactor: scaleFactor,
      confidence: 0.8
    };
  }
  
  return {
    detected: false,
    scaleText: '',
    scaleFactor: 1,
    confidence: 0
  };
}
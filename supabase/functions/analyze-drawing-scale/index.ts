import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectedElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'dimension' | 'line' | 'text';
  coordinates: { x1: number; y1: number; x2: number; y2: number };
  measurement?: number;
  label?: string;
  confidence: number;
}

interface AnalysisResult {
  elements: DetectedElement[];
  suggestions: string[];
  pageSize: string;
  detectedScale: string;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting enhanced drawing analysis...');
    const { image, pageSize, scale, unit } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing drawing with OpenAI Vision API...');
    console.log('Input parameters:', { pageSize, scale, unit });

    // Enhanced system prompt for architectural drawing analysis
    const systemPrompt = `You are an expert architectural drawing analyzer. Analyze this architectural drawing and identify all measurable elements.

TASK: Identify and locate architectural elements in the drawing with their coordinates and measurements.

DRAWING SPECIFICATIONS:
- Page Size: ${pageSize}
- Scale: ${scale}
- Unit: ${unit}

ELEMENT TYPES TO DETECT:
1. WALLS: Structural walls (thick lines, typically 100-300mm thick)
2. DOORS: Door openings with door swings
3. WINDOWS: Window openings 
4. DIMENSIONS: Dimension lines with measurements
5. LINES: Other structural or reference lines
6. TEXT: Labels, room names, measurements

For each element found, provide:
- Precise pixel coordinates (x1, y1, x2, y2) for the start and end points
- Element type classification
- Pixel length measurement for linear elements
- Any visible text labels
- Confidence score (0-1)

Return ONLY a JSON response in this exact format:
{
  "elements": [
    {
      "id": "unique_id",
      "type": "wall|door|window|dimension|line|text",
      "coordinates": { "x1": number, "y1": number, "x2": number, "y2": number },
      "measurement": number_in_pixels,
      "label": "any_text_found",
      "confidence": 0.0_to_1.0
    }
  ],
  "suggestions": ["improvement suggestions"],
  "pageSize": "${pageSize}",
  "detectedScale": "any_scale_text_found_in_drawing",
  "confidence": overall_confidence_0_to_1
}

IMPORTANT: 
- Only return valid JSON
- Coordinates must be within image bounds
- Focus on major architectural elements
- Ignore small decorative details
- Measurement should be pixel distance between coordinates`;

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
                text: `Analyze this ${pageSize} architectural drawing at ${scale} scale. Identify all architectural elements with their coordinates and measurements.`
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
        max_tokens: 2000,
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
    let analysisResult: AnalysisResult;
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Validate and clean the response
      analysisResult = {
        elements: (parsed.elements || []).map((el: any, index: number) => ({
          id: el.id || `element_${index}`,
          type: el.type || 'line',
          coordinates: {
            x1: Math.max(0, el.coordinates?.x1 || 0),
            y1: Math.max(0, el.coordinates?.y1 || 0),
            x2: Math.max(0, el.coordinates?.x2 || 0),
            y2: Math.max(0, el.coordinates?.y2 || 0)
          },
          measurement: el.measurement || calculatePixelDistance(
            el.coordinates?.x1 || 0,
            el.coordinates?.y1 || 0,
            el.coordinates?.x2 || 0,
            el.coordinates?.y2 || 0
          ),
          label: el.label || '',
          confidence: Math.min(1, Math.max(0, el.confidence || 0.5))
        })),
        suggestions: parsed.suggestions || ['Analysis complete'],
        pageSize: parsed.pageSize || pageSize,
        detectedScale: parsed.detectedScale || '',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5))
      };
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback: Create a minimal valid response
      analysisResult = {
        elements: [],
        suggestions: ['Failed to analyze drawing - please try again'],
        pageSize: pageSize,
        detectedScale: '',
        confidence: 0.1
      };
    }

    console.log('Final analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-drawing-scale function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      elements: [],
      suggestions: ['Analysis failed - please try again'],
      pageSize: '',
      detectedScale: '',
      confidence: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculatePixelDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
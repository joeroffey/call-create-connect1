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

interface MeasurementSummary {
  totalElements: number;
  elementCounts: Record<string, number>;
  totalLength: number;
  unit: string;
}

interface AnalysisResult {
  elements: DetectedElement[];
  suggestions: string[];
  pageSize: string;
  detectedScale: string;
  confidence: number;
  summary: MeasurementSummary;
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

    // Calculate scale factor for real-world measurements
    const calculateScaleFactor = (scale: string, pageSize: string, unit: string): number => {
      const scaleMatch = scale.match(/1:(\d+)/);
      if (!scaleMatch) return 0;
      
      const scaleRatio = parseInt(scaleMatch[1]);
      
      const pageDimensions: Record<string, number> = {
        'A4': 210, 'A3': 297, 'A2': 420, 'A1': 594, 'A0': 841,
        'Letter': 216, 'Legal': 216, 'Tabloid': 279
      };
      
      const pageWidthMm = pageDimensions[pageSize] || 210;
      // Assuming image width represents the page width at this scale
      return (pageWidthMm * scaleRatio) / 800; // pixels to mm conversion
    };

    const scaleFactor = calculateScaleFactor(scale, pageSize, unit);

    // Enhanced system prompt for comprehensive architectural analysis
    const systemPrompt = `You are an expert architectural drawing analyzer. Analyze this architectural drawing and provide comprehensive measurements and element detection.

TASK: Identify ALL architectural elements, calculate their real-world measurements, and provide a complete analysis.

DRAWING SPECIFICATIONS:
- Page Size: ${pageSize}
- Scale: ${scale}  
- Unit: ${unit}
- Scale Factor: ${scaleFactor} mm per pixel

ELEMENT TYPES TO DETECT:
1. WALLS: Structural walls, load-bearing walls, partition walls
2. DOORS: Door openings, door swings, entrance doors
3. WINDOWS: Window openings, window frames
4. DIMENSIONS: Dimension lines with measurements, extension lines
5. LINES: Reference lines, construction lines, grid lines
6. TEXT: Labels, room names, dimension text, notes

ANALYSIS REQUIREMENTS:
- Identify EVERY measurable element in the drawing
- Calculate precise real-world measurements using the scale factor
- Detect dimension text and cross-reference with calculated measurements
- Provide comprehensive element categorization
- Generate summary statistics

Return ONLY a JSON response in this exact format:
{
  "elements": [
    {
      "id": "element_1",
      "type": "wall|door|window|dimension|line|text",
      "coordinates": { "x1": number, "y1": number, "x2": number, "y2": number },
      "measurement": pixel_length,
      "realWorldMeasurement": measurement_in_mm,
      "label": "any_text_or_dimension_found",
      "confidence": 0.0_to_1.0
    }
  ],
  "suggestions": ["specific improvement suggestions"],
  "pageSize": "${pageSize}",
  "detectedScale": "any_scale_indication_found",
  "confidence": overall_analysis_confidence,
  "summary": {
    "totalElements": total_count,
    "elementCounts": {
      "wall": count,
      "door": count,
      "window": count,
      "dimension": count,
      "line": count,
      "text": count
    },
    "totalLength": total_length_in_mm,
    "unit": "${unit}"
  }
}

CRITICAL INSTRUCTIONS:
- Calculate realWorldMeasurement = measurement * ${scaleFactor} for each element
- Only return valid JSON, no other text
- Coordinates must be within image bounds  
- Focus on ALL architectural elements, not just major ones
- Be thorough - find walls, openings, dimensions, and reference elements
- Cross-reference dimension text with calculated measurements`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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
          realWorldMeasurement: el.realWorldMeasurement || (el.measurement || 0) * scaleFactor,
          label: el.label || '',
          confidence: Math.min(1, Math.max(0, el.confidence || 0.5))
        })),
        suggestions: parsed.suggestions || ['Analysis complete'],
        pageSize: parsed.pageSize || pageSize,
        detectedScale: parsed.detectedScale || '',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        summary: parsed.summary || {
          totalElements: (parsed.elements || []).length,
          elementCounts: (parsed.elements || []).reduce((acc: any, el: any) => {
            acc[el.type || 'unknown'] = (acc[el.type || 'unknown'] || 0) + 1;
            return acc;
          }, {}),
          totalLength: (parsed.elements || []).reduce((total: number, el: any) => 
            total + ((el.realWorldMeasurement || el.measurement * scaleFactor) || 0), 0
          ),
          unit: unit
        }
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
        confidence: 0.1,
        summary: {
          totalElements: 0,
          elementCounts: {},
          totalLength: 0,
          unit: unit
        }
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
      confidence: 0,
      summary: {
        totalElements: 0,
        elementCounts: {},
        totalLength: 0,
        unit: unit || 'mm'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculatePixelDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
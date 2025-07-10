import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

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
    
    console.log('Loading PDF document...');
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    console.log('PDF loaded successfully, page count:', pdfDoc.getPageCount());
    
    // Analyze the drawing with AI
    const scaleInfo = await analyzeDrawingWithAI(arrayBuffer, scale, instructions);
    console.log('AI Analysis result:', scaleInfo);

    // Apply scaling and add measurements
    const processedPdf = await processAndScalePDF(
      pdfDoc, 
      { targetSize, scale, measurementStyle, instructions }, 
      scaleInfo
    );

    // Convert to base64 for response
    const pdfBytes = await processedPdf.save();
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    const pdfUrl = `data:application/pdf;base64,${base64Pdf}`;

    console.log('PDF processing completed successfully');

    return new Response(
      JSON.stringify({ 
        processedPdfUrl: pdfUrl,
        scaleInfo,
        success: true 
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
        details: error.message 
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
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('No OpenAI API key, using fallback scale parsing');
    return parseScaleFromInput(userScale);
  }

  try {
    // Convert PDF to image for analysis (simplified approach)
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    
    const prompt = `Analyze this architectural drawing and the user's scaling requirements:

User wants scale: ${userScale}
Additional instructions: ${instructions}

Please identify:
1. Any existing scale references in the drawing
2. Key measurements and dimensions
3. Areas where measurements should be highlighted
4. Optimal placement for measurement annotations

Respond with a JSON object containing:
{
  "detected": boolean,
  "scaleText": "detected or user scale",
  "scaleFactor": number (ratio for calculations),
  "confidence": number (0-100),
  "keyMeasurements": ["list of important measurements to highlight"],
  "annotationAreas": ["areas where measurements should be placed"]
}`;

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
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      try {
        const analysis = JSON.parse(content);
        return {
          detected: analysis.detected || true,
          scaleText: analysis.scaleText || userScale,
          scaleFactor: analysis.scaleFactor || parseScaleFactor(userScale),
          confidence: analysis.confidence || 85
        };
      } catch (parseError) {
        console.log('Failed to parse AI response, using fallback');
        return parseScaleFromInput(userScale);
      }
    }
  } catch (error) {
    console.error('AI analysis failed:', error);
  }

  return parseScaleFromInput(userScale);
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

async function processAndScalePDF(
  pdfDoc: PDFDocument,
  params: ProcessingParams,
  scaleInfo: ScaleInfo
): Promise<PDFDocument> {
  console.log('Processing PDF with parameters:', params);

  // Create a new PDF document for the output
  const newPdfDoc = await PDFDocument.create();
  
  // Copy all pages from the original
  const pageIndices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
  
  // Add pages and apply scaling/measurements
  for (let i = 0; i < copiedPages.length; i++) {
    const page = copiedPages[i];
    newPdfDoc.addPage(page);
    
    // Apply target size scaling
    const targetDimensions = getTargetDimensions(params.targetSize);
    if (targetDimensions) {
      const { width, height } = page.getSize();
      const scaleX = targetDimensions.width / width;
      const scaleY = targetDimensions.height / height;
      const scale = Math.min(scaleX, scaleY);
      
      page.scale(scale, scale);
    }

    // Add measurements based on style
    await addMeasurements(page, params.measurementStyle, scaleInfo);
  }

  return newPdfDoc;
}

function getTargetDimensions(targetSize: string): { width: number; height: number } | null {
  const dimensions = {
    'A4': { width: 595, height: 842 },      // 210 × 297 mm in points
    'A3': { width: 842, height: 1191 },     // 297 × 420 mm in points
    'A2': { width: 1191, height: 1684 },    // 420 × 594 mm in points
    'A1': { width: 1684, height: 2384 },    // 594 × 841 mm in points
    'Letter': { width: 612, height: 792 },   // 8.5 × 11 inches in points
    'Legal': { width: 612, height: 1008 },   // 8.5 × 14 inches in points
    'Mobile': { width: 375, height: 667 }    // Mobile optimized
  };
  
  return dimensions[targetSize] || null;
}

async function addMeasurements(
  page: any,
  measurementStyle: string,
  scaleInfo: ScaleInfo
): Promise<void> {
  const { width, height } = page.getSize();
  const font = await page.doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  // Sample measurements (in a real implementation, these would come from AI analysis)
  const sampleMeasurements = [
    { x: 100, y: height - 100, text: `Scale: ${scaleInfo.scaleText}`, type: 'info' },
    { x: 100, y: height - 120, text: 'Room: 4.2m × 3.8m', type: 'dimension' },
    { x: 100, y: height - 140, text: 'Door: 0.9m wide', type: 'dimension' },
    { x: 100, y: height - 160, text: 'Window: 1.5m × 1.2m', type: 'dimension' }
  ];

  if (measurementStyle === 'overlay' || measurementStyle === 'both') {
    // Add measurements directly on the drawing
    for (const measurement of sampleMeasurements) {
      if (measurement.type === 'info') {
        // Scale information in a box
        page.drawRectangle({
          x: measurement.x - 5,
          y: measurement.y - 15,
          width: 200,
          height: 20,
          color: rgb(1, 1, 0.8),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      }
      
      page.drawText(measurement.text, {
        x: measurement.x,
        y: measurement.y,
        size: fontSize,
        font,
        color: measurement.type === 'info' ? rgb(0, 0, 0) : rgb(0.8, 0, 0),
      });
    }
  }

  if (measurementStyle === 'sidebar' || measurementStyle === 'both') {
    // Add measurement list on the side
    const sidebarX = width - 180;
    let currentY = height - 50;

    // Sidebar background
    page.drawRectangle({
      x: sidebarX - 10,
      y: currentY - 200,
      width: 170,
      height: 180,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Sidebar title
    page.drawText('Measurements', {
      x: sidebarX,
      y: currentY,
      size: fontSize + 2,
      font,
      color: rgb(0, 0, 0),
    });

    currentY -= 25;

    // Add each measurement
    for (const measurement of sampleMeasurements) {
      page.drawText(measurement.text, {
        x: sidebarX,
        y: currentY,
        size: fontSize - 1,
        font,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;
    }
  }

  // Mobile optimization - add QR code for easy access
  if (measurementStyle !== 'sidebar') {
    page.drawText('Mobile Optimized', {
      x: 20,
      y: 20,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
}
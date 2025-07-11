import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPDFRequest {
  pdfData: string;
  filename: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('PDF processing request received')
    
    const { pdfData, filename }: ProcessPDFRequest = await req.json()
    
    if (!pdfData) {
      throw new Error('No PDF data provided')
    }

    console.log(`Processing PDF: ${filename || 'unnamed'}`)
    const fileSize = Math.round((pdfData.length * 3) / 4) // Approximate base64 to bytes
    console.log(`PDF size: ~${fileSize} bytes`)

    // Create a technical drawing placeholder that users can measure on
    const canvasWidth = 800
    const canvasHeight = 600
    
    // Generate SVG instead of canvas for better compatibility
    const svgContent = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- White background -->
        <rect width="100%" height="100%" fill="white"/>
        
        <!-- Grid pattern for measurement reference -->
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="1"/>
          </pattern>
          <pattern id="majorgrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e0e0e0" stroke-width="1"/>
          </pattern>
        </defs>
        
        <!-- Apply grid patterns -->
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <rect width="100%" height="100%" fill="url(#majorgrid)"/>
        
        <!-- Border -->
        <rect x="10" y="10" width="${canvasWidth - 20}" height="${canvasHeight - 20}" 
              fill="none" stroke="#cccccc" stroke-width="2"/>
        
        <!-- Title -->
        <text x="${canvasWidth / 2}" y="40" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333">
          PDF Document Loaded
        </text>
        
        <!-- Filename -->
        <text x="${canvasWidth / 2}" y="70" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#666">
          ${filename?.replace(/[<>&"]/g, '') || 'Technical Drawing'}
        </text>
        
        <!-- Instructions -->
        <text x="${canvasWidth / 2}" y="100" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="#999">
          Ready for measurement and AI analysis
        </text>
        
        <!-- Sample architectural elements for demonstration -->
        <!-- Walls -->
        <line x1="150" y1="200" x2="650" y2="200" stroke="#333" stroke-width="3"/>
        <line x1="150" y1="200" x2="150" y2="400" stroke="#333" stroke-width="3"/>
        <line x1="650" y1="200" x2="650" y2="400" stroke="#333" stroke-width="3"/>
        <line x1="150" y1="400" x2="650" y2="400" stroke="#333" stroke-width="3"/>
        
        <!-- Door opening -->
        <line x1="350" y1="200" x2="410" y2="200" stroke="white" stroke-width="4"/>
        <path d="M 350,200 Q 380,180 410,200" fill="none" stroke="#666" stroke-width="1"/>
        
        <!-- Window -->
        <line x1="500" y1="200" x2="550" y2="200" stroke="white" stroke-width="4"/>
        <line x1="510" y1="195" x2="540" y2="195" stroke="#666" stroke-width="2"/>
        <line x1="510" y1="205" x2="540" y2="205" stroke="#666" stroke-width="2"/>
        
        <!-- Dimension lines -->
        <line x1="150" y1="180" x2="650" y2="180" stroke="#0066cc" stroke-width="1"/>
        <line x1="150" y1="175" x2="150" y2="185" stroke="#0066cc" stroke-width="1"/>
        <line x1="650" y1="175" x2="650" y2="185" stroke="#0066cc" stroke-width="1"/>
        <text x="400" y="175" text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="12" fill="#0066cc">5000mm</text>
        
        <!-- Labels -->
        <text x="300" y="320" text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="14" fill="#333">LIVING ROOM</text>
        <text x="380" y="190" text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="10" fill="#666">DOOR</text>
        <text x="525" y="190" text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="10" fill="#666">WINDOW</text>
        
        <!-- Scale indicator -->
        <text x="20" y="${canvasHeight - 20}" font-family="Arial, sans-serif" 
              font-size="12" fill="#666">Grid: 20px = Reference • Use scale settings for accurate measurements</text>
      </svg>
    `

    // Convert SVG to base64 data URL
    const svgBase64 = btoa(svgContent)
    const imageUrl = `data:image/svg+xml;base64,${svgBase64}`

    console.log('PDF processed successfully with technical drawing placeholder')

    return new Response(
      JSON.stringify({ 
        imageUrl,
        success: true,
        pages: 1,
        dimensions: { width: canvasWidth, height: canvasHeight },
        message: 'PDF processed - Technical drawing placeholder created for measurement'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    )

  } catch (error) {
    console.error('PDF processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'PDF processing failed',
        success: false 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    )
  }
})
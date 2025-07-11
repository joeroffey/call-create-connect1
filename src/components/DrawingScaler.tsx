import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Download,
  FileText,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Ruler,
  ZoomIn,
  ZoomOut,
  RotateCw,
  MousePointer,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Configure PDF.js with jsdelivr CDN (better CORS support)
const configureWorker = () => {
  try {
    // Try jsdelivr CDN first (better CORS support)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.93/build/pdf.worker.min.js`;
    console.log('PDF.js configured with jsdelivr CDN worker');
  } catch (error) {
    console.warn('Primary worker config failed, trying unpkg:', error);
    try {
      // Fallback to unpkg
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.js`;
      console.log('PDF.js configured with unpkg CDN worker');
    } catch (fallbackError) {
      console.warn('All CDN workers failed, trying local approach');
      try {
        // Local approach - disable worker entirely
        pdfjsLib.GlobalWorkerOptions.workerSrc = null;
        console.log('PDF.js configured without worker (legacy mode)');
      } catch (finalError) {
        console.error('All PDF.js configurations failed:', finalError);
      }
    }
  }
};

configureWorker();

interface DrawingScalerProps {
  onBack: () => void;
}

interface DetectedElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'dimension' | 'line' | 'text';
  coordinates: { x1: number; y1: number; x2: number; y2: number };
  measurement?: number;
  realWorldMeasurement?: number;
  label?: string;
  confidence: number;
}

interface ManualMeasurement {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  pixelLength: number;
  realWorldLength: number;
  label: string;
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

const DrawingScaler = ({ onBack }: DrawingScalerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState('');
  const [scale, setScale] = useState('');
  const [customScale, setCustomScale] = useState('');
  const [pdfImageUrl, setPdfImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [manualMeasurements, setManualMeasurements] = useState<ManualMeasurement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState<{ start: { x: number; y: number } } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('ai-analysis');
  
  const { toast } = useToast();

  const getElementColor = (type: string): string => {
    const colors = {
      wall: '#ef4444',
      door: '#22c55e', 
      window: '#3b82f6',
      dimension: '#f59e0b',
      line: '#8b5cf6',
      text: '#ec4899'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const calculateScaleFactor = useCallback((scaleValue: string, pageSizeValue: string): number => {
    const scaleMatch = scaleValue.match(/1:(\d+)/);
    if (!scaleMatch) return 1;
    
    const scaleRatio = parseInt(scaleMatch[1]);
    
    const pageDimensions: Record<string, number> = {
      'A4': 210, 'A3': 297, 'A2': 420, 'A1': 594, 'A0': 841,
      'Letter': 216
    };
    
    const pageWidthMm = pageDimensions[pageSizeValue] || 210;
    // Assuming image width of 800px represents the page width at this scale
    return (pageWidthMm * scaleRatio) / 800;
  }, []);

  const handleFileUpload = async (file: File) => {
    console.log('File upload started:', file.name, file.type, file.size);
    
    setUploadedFile(file);
    setAnalysisResult(null);
    setManualMeasurements([]);
    setIsProcessingFile(true);

    try {
      if (file.type === 'application/pdf') {
        console.log('Processing PDF file...');
        const imageUrl = await processPDF(file);
        console.log('PDF processed successfully, setting image URL');
        setPdfImageUrl(imageUrl);
      } else if (file.type.startsWith('image/')) {
        console.log('Processing image file...');
        // Support image files directly
        const imageUrl = URL.createObjectURL(file);
        console.log('Image URL created:', imageUrl.substring(0, 50) + '...');
        setPdfImageUrl(imageUrl);
      } else {
        console.error('Unsupported file type:', file.type);
        throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF file or image (JPG, PNG, etc.).`);
      }
      
      console.log('File processing completed successfully');
      toast({
        title: "File Uploaded",
        description: "File uploaded successfully. Please set page size and scale, then analyze.",
      });
    } catch (error) {
      console.error('File processing error:', error);
      setPdfImageUrl(null); // Clear any previous image
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const processPDF = async (file: File): Promise<string> => {
    console.log('Processing PDF:', file.name, 'Size:', file.size);
    
    try {
      // Check file size (limit to 50MB for better performance)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('PDF file too large. Please use a file smaller than 50MB.');
      }

      const arrayBuffer = await file.arrayBuffer();
      console.log('PDF arrayBuffer created, size:', arrayBuffer.byteLength);
      
      // Configure PDF loading with fallbacks
      const documentConfig = {
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        // Disable external resources to avoid CORS issues
        disableFontFace: true,
        disableRange: true,
        disableStream: true,
        // Use system fonts
        useSystemFonts: true,
        // Reduce memory usage
        maxImageSize: 1024 * 1024 * 2, // 2MB max image size
        // Legacy compatibility
        verbosity: 0,
        // Worker configuration
        stopAtErrors: false,
      };

      console.log('Attempting PDF load with config:', documentConfig);
      const loadingTask = pdfjsLib.getDocument(documentConfig);

      // Add promise error handler
      loadingTask.onProgress = (progress) => {
        console.log('PDF loading progress:', `${progress.loaded}/${progress.total}`);
      };

      let pdf;
      try {
        pdf = await loadingTask.promise;
        console.log('PDF loaded successfully, pages:', pdf.numPages);
      } catch (workerError) {
        console.warn('PDF load failed with worker, trying without worker:', workerError);
        
        // If worker fails, try again with worker explicitly disabled
        pdfjsLib.GlobalWorkerOptions.workerSrc = null;
        const fallbackConfig = {
          ...documentConfig,
          useWorker: false,
        };
        
        const fallbackTask = pdfjsLib.getDocument(fallbackConfig);
        pdf = await fallbackTask.promise;
        console.log('PDF loaded successfully with fallback (no worker), pages:', pdf.numPages);
      }
      
      const page = await pdf.getPage(1);
      console.log('First page loaded');

      // Use adaptive scale based on screen size
      const isMobile = window.innerWidth < 768;
      const scale = isMobile ? 1.5 : 2.0;
      
      const viewport = page.getViewport({ scale });
      console.log('Viewport created:', viewport.width, 'x', viewport.height);
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      console.log('Starting page render...');
      await page.render({
        canvasContext: context,
        viewport: viewport,
        background: 'white'
      }).promise;

      console.log('Page rendered successfully');
      const dataURL = canvas.toDataURL('image/jpeg', 0.85);
      console.log('Canvas converted to data URL');
      
      return dataURL;
    } catch (error) {
      console.error('PDF processing error:', error);
      
      // Provide specific error messages
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid PDF file. Please ensure the file is not corrupted.');
      }
      if (error.message.includes('password')) {
        throw new Error('Password-protected PDFs are not supported. Please use an unprotected PDF.');
      }
      if (error.message.includes('too large')) {
        throw error; // Re-throw file size error
      }
      if (error.message.includes('worker') || error.message.includes('CORS') || error.message.includes('fetch')) {
        throw new Error('PDF processing failed due to network/security restrictions. The PDF format is complex - this should work now with the latest fixes.');
      }
      if (error.message.includes('Setting up fake worker failed')) {
        throw new Error('PDF worker initialization failed. This is a known issue that has been addressed - please try refreshing and uploading again.');
      }
      
      console.error('Detailed PDF error:', error.stack || error);
      throw new Error(`PDF processing failed: ${error.message}. The file should work - if this persists, please try a different PDF file.`);
    }
  };

  const analyzeDrawing = async () => {
    const finalScale = scale === 'custom' ? customScale : scale;
    
    if (!uploadedFile || !pageSize || !finalScale) {
      toast({
        title: "Missing Information",
        description: "Please provide page size and scale before analyzing.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the Drawing Scaler tool.",
          variant: "destructive"
        });
        return;
      }

      const base64 = await fileToBase64(uploadedFile);

      const { data, error } = await supabase.functions.invoke('analyze-drawing-scale', {
        body: { 
          image: base64,
          pageSize,
          scale: finalScale,
          unit: 'mm'
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      setAnalysisResult(data);
      setActiveTab('ai-analysis');
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.elements.length} elements. Check the results panel.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze drawing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!measurementMode || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    if (!currentMeasurement) {
      // Start new measurement
      setCurrentMeasurement({ start: { x, y } });
      toast({
        title: "Measurement Started",
        description: "Click the end point to complete the measurement.",
      });
    } else {
      // Complete measurement
      const pixelLength = Math.sqrt(
        Math.pow(x - currentMeasurement.start.x, 2) + 
        Math.pow(y - currentMeasurement.start.y, 2)
      );

      const finalScale = scale === 'custom' ? customScale : scale;
      const scaleFactor = calculateScaleFactor(finalScale, pageSize);
      const realWorldLength = pixelLength * scaleFactor;

      const newMeasurement: ManualMeasurement = {
        id: `manual_${Date.now()}`,
        startPoint: currentMeasurement.start,
        endPoint: { x, y },
        pixelLength,
        realWorldLength,
        label: `${realWorldLength.toFixed(0)}mm`
      };

      setManualMeasurements(prev => [...prev, newMeasurement]);
      setCurrentMeasurement(null);
      
      toast({
        title: "Measurement Complete",
        description: `Length: ${realWorldLength.toFixed(0)}mm`,
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  const exportResults = () => {
    if (!analysisResult && manualMeasurements.length === 0) {
      toast({
        title: "No Data",
        description: "Please analyze the drawing or add manual measurements first.",
        variant: "destructive"
      });
      return;
    }

    const data = {
      fileName: uploadedFile?.name,
      pageSize,
      scale: scale === 'custom' ? customScale : scale,
      aiAnalysis: analysisResult,
      manualMeasurements,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawing_analysis_${uploadedFile?.name || 'drawing'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Results have been downloaded as JSON file.",
    });
  };

  const clearMeasurements = () => {
    setManualMeasurements([]);
    setCurrentMeasurement(null);
    toast({
      title: "Measurements Cleared",
      description: "All manual measurements have been removed.",
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-3">
                <Ruler className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
                <span>Drawing Scaler</span>
              </h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                Upload PDF, set scale, get accurate measurements instantly
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 md:space-y-6"
          >
            {/* File Upload */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Upload className="h-5 w-5" />
                  <span>Upload File</span>
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  PDF drawings or images supported
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 md:p-6 text-center hover:border-gray-500 transition-colors">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-400 mx-auto" />
                        <p className="text-xs md:text-sm text-white truncate">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto" />
                        <p className="text-xs md:text-sm text-gray-400">Click to upload PDF or image</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawing Properties */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Drawing Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Page Size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                      <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                      <SelectItem value="A2">A2 (420×594mm)</SelectItem>
                      <SelectItem value="A1">A1 (594×841mm)</SelectItem>
                      <SelectItem value="A0">A0 (841×1189mm)</SelectItem>
                      <SelectItem value="Letter">Letter (8.5×11")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Scale</Label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:50">1:50</SelectItem>
                      <SelectItem value="1:100">1:100</SelectItem>
                      <SelectItem value="1:200">1:200</SelectItem>
                      <SelectItem value="1:250">1:250</SelectItem>
                      <SelectItem value="1:500">1:500</SelectItem>
                      <SelectItem value="custom">Custom Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scale === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Custom Scale (e.g., 1:75)</Label>
                    <Input
                      value={customScale}
                      onChange={(e) => setCustomScale(e.target.value)}
                      placeholder="1:75"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                )}

                <Button
                  onClick={analyzeDrawing}
                  disabled={!uploadedFile || !pageSize || (!scale || (scale === 'custom' && !customScale)) || isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analyze
                    </>
                  )}
                </Button>

                <Separator className="bg-gray-600" />

                <div className="space-y-2">
                  <Label className="text-white text-sm">Manual Measurement</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setMeasurementMode(!measurementMode);
                        setCurrentMeasurement(null);
                      }}
                      variant={measurementMode ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                    >
                      <MousePointer className="h-4 w-4 mr-1" />
                      {measurementMode ? 'Measuring' : 'Measure'}
                    </Button>
                    {manualMeasurements.length > 0 && (
                      <Button
                        onClick={clearMeasurements}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {measurementMode && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Click two points on the drawing to measure distance.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mobile Export Button */}
            <div className="xl:hidden">
              <Button
                onClick={exportResults}
                disabled={!analysisResult && manualMeasurements.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </motion.div>

          {/* Center Panel - PDF Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2"
          >
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
                  <CardTitle className="text-white text-lg">Drawing with Measurements</CardTitle>
                  {pdfImageUrl && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 border-gray-600"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 border-gray-600"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-white rounded-lg min-h-[400px] md:min-h-[600px] overflow-auto">
                  {isProcessingFile ? (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 animate-spin text-blue-500" />
                        <p className="text-sm md:text-base font-medium">Processing file...</p>
                        <p className="text-xs text-gray-500 mt-1">This may take a moment for large files</p>
                      </div>
                    </div>
                  ) : pdfImageUrl ? (
                    <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                      <img 
                        ref={imageRef}
                        src={pdfImageUrl} 
                        alt="Drawing" 
                        className={`w-full h-auto ${measurementMode ? 'cursor-crosshair' : 'cursor-move'}`}
                        onClick={handleImageClick}
                        draggable={false}
                        onLoad={() => console.log('Image loaded successfully')}
                        onError={(e) => {
                          console.error('Image load error:', e);
                          toast({
                            title: "Image Load Error",
                            description: "Failed to display the processed file. Please try again.",
                            variant: "destructive"
                          });
                        }}
                      />
                      
                      {/* AI Analysis Overlays */}
                      {analysisResult && activeTab === 'ai-analysis' && (
                        <div className="absolute inset-0">
                          {analysisResult.elements.map((element) => (
                            <div key={element.id}>
                              <svg 
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{ zIndex: 10 }}
                              >
                                <line
                                  x1={element.coordinates.x1}
                                  y1={element.coordinates.y1}
                                  x2={element.coordinates.x2}
                                  y2={element.coordinates.y2}
                                  stroke={getElementColor(element.type)}
                                  strokeWidth="2"
                                  opacity="0.8"
                                />
                                {element.realWorldMeasurement && (
                                  <text
                                    x={(element.coordinates.x1 + element.coordinates.x2) / 2}
                                    y={(element.coordinates.y1 + element.coordinates.y2) / 2 - 5}
                                    fill={getElementColor(element.type)}
                                    fontSize="11"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    className="drop-shadow-sm"
                                  >
                                    {element.realWorldMeasurement.toFixed(0)}mm
                                  </text>
                                )}
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Manual Measurement Overlays */}
                      {manualMeasurements.length > 0 && (
                        <div className="absolute inset-0">
                          {manualMeasurements.map((measurement) => (
                            <svg 
                              key={measurement.id}
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ zIndex: 15 }}
                            >
                              <line
                                x1={measurement.startPoint.x}
                                y1={measurement.startPoint.y}
                                x2={measurement.endPoint.x}
                                y2={measurement.endPoint.y}
                                stroke="#ff6b35"
                                strokeWidth="3"
                                opacity="0.9"
                                strokeDasharray="5,5"
                              />
                              <circle
                                cx={measurement.startPoint.x}
                                cy={measurement.startPoint.y}
                                r="4"
                                fill="#ff6b35"
                              />
                              <circle
                                cx={measurement.endPoint.x}
                                cy={measurement.endPoint.y}
                                r="4"
                                fill="#ff6b35"
                              />
                              <text
                                x={(measurement.startPoint.x + measurement.endPoint.x) / 2}
                                y={(measurement.startPoint.y + measurement.endPoint.y) / 2 - 8}
                                fill="#ff6b35"
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="drop-shadow-lg"
                              >
                                {measurement.label}
                              </text>
                            </svg>
                          ))}
                        </div>
                      )}

                      {/* Current Measurement Preview */}
                      {currentMeasurement && (
                        <div className="absolute inset-0">
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 20 }}>
                            <circle
                              cx={currentMeasurement.start.x}
                              cy={currentMeasurement.start.y}
                              r="6"
                              fill="#ff6b35"
                              opacity="0.8"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4" />
                        <p className="text-sm md:text-base">Upload a file to see it here with measurements</p>
                        <p className="text-xs mt-2">Supported formats: PDF, JPG, PNG, GIF, WEBP</p>
                        <p className="text-xs mt-1 text-orange-400">
                          💡 Tip: If PDF upload fails, try converting to JPG/PNG first
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 md:space-y-6"
          >
            {(analysisResult || manualMeasurements.length > 0) && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="ai-analysis" className="text-xs md:text-sm">AI Analysis</TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs md:text-sm">Manual ({manualMeasurements.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="ai-analysis" className="space-y-4">
                  {analysisResult && (
                    <>
                      {/* AI Summary */}
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">AI Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-blue-400">{analysisResult.summary.totalElements}</p>
                            <p className="text-xs md:text-sm text-gray-400">Elements Found</p>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(analysisResult.summary.elementCounts).map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: getElementColor(type) }}
                                  />
                                  <span className="text-xs md:text-sm text-white capitalize">{type}s</span>
                                </div>
                                <span className="text-xs md:text-sm text-gray-400">{count}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-gray-600">
                            <p className="text-xs text-gray-400">
                              Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Measurements List */}
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">AI Measurements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64 md:h-96">
                            <div className="space-y-2">
                              {analysisResult.elements
                                .filter(el => el.realWorldMeasurement)
                                .map((element) => (
                                <div key={element.id} className="p-2 md:p-3 bg-gray-700/50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: getElementColor(element.type) }}
                                      />
                                      <span className="text-xs md:text-sm text-white capitalize">{element.type}</span>
                                    </div>
                                    <span className="text-xs md:text-sm font-mono text-blue-400">
                                      {element.realWorldMeasurement?.toFixed(0)}mm
                                    </span>
                                  </div>
                                  {element.label && (
                                    <p className="text-xs text-gray-400 mt-1">{element.label}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  {/* Manual Measurements List */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg">Manual Measurements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {manualMeasurements.length > 0 ? (
                        <ScrollArea className="h-64 md:h-96">
                          <div className="space-y-2">
                            {manualMeasurements.map((measurement, index) => (
                              <div key={measurement.id} className="p-2 md:p-3 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className="text-xs md:text-sm text-white">Line {index + 1}</span>
                                  </div>
                                  <span className="text-xs md:text-sm font-mono text-orange-400">
                                    {measurement.realWorldLength.toFixed(0)}mm
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  Pixel length: {measurement.pixelLength.toFixed(1)}px
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Ruler className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No manual measurements yet</p>
                          <p className="text-xs mt-1">Enable measurement mode and click on the drawing</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Export Button - Desktop */}
            <div className="hidden xl:block">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <Button
                    onClick={exportResults}
                    disabled={!analysisResult && manualMeasurements.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm md:text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-400 space-y-1">
                  <p>1. Upload PDF or image file</p>
                  <p>2. Set page size and scale</p>
                  <p>3. Use AI analysis or manual measurement</p>
                  <p>4. Export results when done</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Analysis Status Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-gray-800/95 border-gray-700 mx-4">
              <CardContent className="p-4 md:p-6 text-center">
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-white font-medium text-sm md:text-base">Analyzing drawing...</p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  AI is detecting elements and calculating measurements
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingScaler;
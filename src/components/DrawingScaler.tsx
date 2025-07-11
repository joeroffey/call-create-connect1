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
  MousePointer,
  Info,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DrawingScalerProps {
  onBack: () => void;
}

interface Measurement {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  pixelLength: number;
  realLength: number;
  label: string;
  color: string;
}

interface AIElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'dimension' | 'text';
  coordinates: [number, number, number, number];
  length: number;
  confidence: number;
}

interface AnalysisResults {
  elements: AIElement[];
  totalElements: number;
  pageSize: string;
  scale: string;
  confidence: number;
}

const SCALE_OPTIONS = [
  { value: '1:50', label: '1:50' },
  { value: '1:100', label: '1:100' },
  { value: '1:200', label: '1:200' },
  { value: '1:250', label: '1:250' },
  { value: '1:500', label: '1:500' },
  { value: 'custom', label: 'Custom Scale' }
];

const PAGE_SIZES = [
  { value: 'A4', label: 'A4 (210×297mm)', width: 210 },
  { value: 'A3', label: 'A3 (297×420mm)', width: 297 },
  { value: 'A2', label: 'A2 (420×594mm)', width: 420 },
  { value: 'A1', label: 'A1 (594×841mm)', width: 594 },
  { value: 'A0', label: 'A0 (841×1189mm)', width: 841 },
  { value: 'Letter', label: 'Letter (8.5×11")', width: 216 }
];

const MEASUREMENT_COLORS = [
  '#ff6b35', // Orange
  '#4ecdc4', // Teal  
  '#45b7d1', // Blue
  '#96ceb4', // Green
  '#ffd93d', // Yellow
  '#ff9ff3'  // Pink
];

export default function DrawingScaler({ onBack }: DrawingScalerProps) {
  // Core state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfImageUrl, setPdfImageUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<string>('');
  const [scale, setScale] = useState<string>('');
  const [customScale, setCustomScale] = useState<string>('');
  
  // Measurement state
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [pendingMeasurement, setPendingMeasurement] = useState<{x: number, y: number} | null>(null);
  
  // AI Analysis state
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [showAIOverlay, setShowAIOverlay] = useState(true);
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'measurements' | 'ai'>('measurements');
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  // Calculate scale factor for measurements
  const getScaleFactor = useCallback(() => {
    const selectedScale = scale === 'custom' ? customScale : scale;
    const scaleMatch = selectedScale.match(/1:(\d+)/);
    if (!scaleMatch || !pageSize) return 1;
    
    const scaleRatio = parseInt(scaleMatch[1]);
    const pageInfo = PAGE_SIZES.find(p => p.value === pageSize);
    if (!pageInfo) return 1;
    
    // Assuming image width represents page width
    const imageWidth = imageRef.current?.naturalWidth || 800;
    return (pageInfo.width * scaleRatio) / imageWidth;
  }, [scale, customScale, pageSize]);

  // Handle PDF upload and processing
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File Too Large", 
        description: "Please upload a PDF smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    setMeasurements([]);
    setAnalysisResults(null);
    setPdfImageUrl(null);
    setIsProcessing(true);

    try {
      await processPDFToImage(file);
      toast({
        title: "PDF Uploaded Successfully",
        description: "Set your page size and scale, then start measuring.",
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process PDF to image using server-side function
  const processPDFToImage = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to use the Drawing Scaler.');
      }

      // Convert PDF to base64 for server processing
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('process-pdf-drawing', {
        body: { 
          pdfData: base64,
          filename: file.name 
        }
      });

      if (error) throw error;
      if (!data?.imageUrl) throw new Error('No image URL returned from server');

      setPdfImageUrl(data.imageUrl);
      console.log('PDF processed successfully on server');
      
    } catch (error) {
      console.error('Server PDF processing failed:', error);
      throw new Error('Failed to process PDF. Please try a different file or check your connection.');
    }
  };

  // Convert file to base64
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

  // Handle click on image for measurements
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!measurementMode || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    if (!pendingMeasurement) {
      // Start new measurement
      setPendingMeasurement({ x, y });
      toast({
        title: "Measurement Started",
        description: "Click the end point to complete measurement.",
      });
    } else {
      // Complete measurement
      const pixelLength = Math.sqrt(
        Math.pow(x - pendingMeasurement.x, 2) + 
        Math.pow(y - pendingMeasurement.y, 2)
      );

      const scaleFactor = getScaleFactor();
      const realLength = pixelLength * scaleFactor;
      const colorIndex = measurements.length % MEASUREMENT_COLORS.length;

      const newMeasurement: Measurement = {
        id: `measurement_${Date.now()}`,
        startX: pendingMeasurement.x,
        startY: pendingMeasurement.y,
        endX: x,
        endY: y,
        pixelLength,
        realLength,
        label: `${realLength.toFixed(0)}mm`,
        color: MEASUREMENT_COLORS[colorIndex]
      };

      setMeasurements(prev => [...prev, newMeasurement]);
      setPendingMeasurement(null);
      
      toast({
        title: "Measurement Complete",
        description: `Length: ${realLength.toFixed(0)}mm`,
      });
    }
  };

  // AI Analysis
  const runAIAnalysis = async () => {
    if (!uploadedFile || !pageSize || !scale) {
      toast({
        title: "Missing Information",
        description: "Please upload a PDF and set page size and scale first.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to use AI analysis.');
      }

      const base64 = await fileToBase64(uploadedFile);
      const finalScale = scale === 'custom' ? customScale : scale;

      const { data, error } = await supabase.functions.invoke('analyze-drawing-scale', {
        body: { 
          image: base64,
          pageSize,
          scale: finalScale,
          unit: 'mm'
        }
      });

      if (error) throw error;

      // Convert API response format to component format
      const convertedElements = (data.elements || []).map((element: any) => ({
        id: element.id,
        type: element.type,
        coordinates: [
          element.coordinates.x1,
          element.coordinates.y1,
          element.coordinates.x2,
          element.coordinates.y2
        ] as [number, number, number, number],
        length: element.realWorldMeasurement || 0,
        confidence: element.confidence || 0
      }));

      setAnalysisResults({
        elements: convertedElements,
        totalElements: data.summary?.totalElements || 0,
        pageSize,
        scale: finalScale,
        confidence: data.confidence || 0
      });

      setViewMode('ai');
      
      toast({
        title: "AI Analysis Complete",
        description: `Found ${data.elements?.length || 0} elements in the drawing.`,
      });

    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "AI analysis failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export results
  const exportResults = () => {
    if (measurements.length === 0 && !analysisResults) {
      toast({
        title: "No Data to Export",
        description: "Create some measurements or run AI analysis first.",
        variant: "destructive"
      });
      return;
    }

    const exportData = {
      filename: uploadedFile?.name,
      pageSize,
      scale: scale === 'custom' ? customScale : scale,
      manualMeasurements: measurements,
      aiAnalysis: analysisResults,
      totalMeasurements: measurements.length,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawing_measurements_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Measurements exported successfully.",
    });
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setPendingMeasurement(null);
    setMeasurementMode(false);
    toast({
      title: "Measurements Cleared",
      description: "All measurements have been removed.",
    });
  };

  const getElementColor = (type: string): string => {
    const colors = {
      wall: '#ef4444',
      door: '#22c55e',
      window: '#3b82f6', 
      dimension: '#f59e0b',
      text: '#ec4899'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
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
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-3">
                <Ruler className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
                <span>Drawing Scaler Pro</span>
              </h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                Professional PDF measurement tool with AI analysis
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
          
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            
            {/* File Upload */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Upload className="h-5 w-5" />
                  <span>Upload PDF Drawing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                        <p className="text-sm text-white truncate">{uploadedFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-400">Click to upload PDF</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawing Configuration */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Drawing Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Page Size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Drawing Scale</Label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
              </CardContent>
            </Card>

            {/* Measurement Tools */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Measurement Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setMeasurementMode(!measurementMode)}
                  variant={measurementMode ? "default" : "outline"}
                  className="w-full"
                  disabled={!pdfImageUrl || !pageSize || !scale}
                >
                  <MousePointer className="h-4 w-4 mr-2" />
                  {measurementMode ? 'Stop Measuring' : 'Start Measuring'}
                </Button>

                <Button
                  onClick={runAIAnalysis}
                  disabled={!uploadedFile || !pageSize || !scale || isAnalyzing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analysis
                    </>
                  )}
                </Button>

                {measurements.length > 0 && (
                  <Button onClick={clearMeasurements} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}

                {measurementMode && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Click two points on the drawing to measure distance.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                <Button
                  onClick={exportResults}
                  disabled={measurements.length === 0 && !analysisResults}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </CardContent>
            </Card>

          </motion.div>

          {/* Center Panel - Drawing Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2"
          >
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
                  <CardTitle className="text-white text-lg">Drawing Viewer</CardTitle>
                  {pdfImageUrl && (
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 border-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-400 min-w-[4rem] text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 border-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-white rounded-lg min-h-[400px] md:min-h-[600px] overflow-auto">
                  {isProcessing ? (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
                        <p className="font-medium">Processing PDF...</p>
                        <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                      </div>
                    </div>
                  ) : pdfImageUrl ? (
                    <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                      <img 
                        ref={imageRef}
                        src={pdfImageUrl} 
                        alt="PDF Drawing" 
                        className={`w-full h-auto ${measurementMode ? 'cursor-crosshair' : 'cursor-move'}`}
                        onClick={handleImageClick}
                        draggable={false}
                        onLoad={() => console.log('PDF image loaded successfully')}
                        onError={() => {
                          toast({
                            title: "Display Error",
                            description: "Failed to display PDF. Please try uploading again.",
                            variant: "destructive"
                          });
                        }}
                      />
                      
                      {/* Manual Measurements Overlay */}
                      {viewMode === 'measurements' && (
                        <div className="absolute inset-0">
                          {measurements.map((measurement) => (
                            <svg 
                              key={measurement.id}
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ zIndex: 10 }}
                            >
                              <line
                                x1={measurement.startX}
                                y1={measurement.startY}
                                x2={measurement.endX}
                                y2={measurement.endY}
                                stroke={measurement.color}
                                strokeWidth="3"
                                opacity="0.9"
                                strokeDasharray="5,5"
                              />
                              <circle
                                cx={measurement.startX}
                                cy={measurement.startY}
                                r="4"
                                fill={measurement.color}
                              />
                              <circle
                                cx={measurement.endX}
                                cy={measurement.endY}
                                r="4"
                                fill={measurement.color}
                              />
                              <text
                                x={(measurement.startX + measurement.endX) / 2}
                                y={(measurement.startY + measurement.endY) / 2 - 8}
                                fill={measurement.color}
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="drop-shadow-lg"
                              >
                                {measurement.label}
                              </text>
                            </svg>
                          ))}
                          
                          {/* Pending measurement */}
                          {pendingMeasurement && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
                              <circle
                                cx={pendingMeasurement.x}
                                cy={pendingMeasurement.y}
                                r="6"
                                fill="#ff6b35"
                                opacity="0.8"
                              />
                            </svg>
                          )}
                        </div>
                      )}

                      {/* AI Analysis Overlay */}
                      {viewMode === 'ai' && analysisResults && showAIOverlay && (
                        <div className="absolute inset-0">
                          {analysisResults.elements.map((element) => (
                            <svg 
                              key={element.id}
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ zIndex: 10 }}
                            >
                              <line
                                x1={element.coordinates[0]}
                                y1={element.coordinates[1]}
                                x2={element.coordinates[2]}
                                y2={element.coordinates[3]}
                                stroke={getElementColor(element.type)}
                                strokeWidth="2"
                                opacity="0.8"
                              />
                              <text
                                x={(element.coordinates[0] + element.coordinates[2]) / 2}
                                y={(element.coordinates[1] + element.coordinates[3]) / 2 - 5}
                                fill={getElementColor(element.type)}
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                                className="drop-shadow-sm"
                              >
                                {element.length.toFixed(0)}mm
                              </text>
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Upload a PDF to get started</p>
                        <p className="text-sm mt-2">Supports architectural drawings and technical plans</p>
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
            className="space-y-4"
          >
            
            {/* View Mode Toggle */}
            {(measurements.length > 0 || analysisResults) && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setViewMode('measurements')}
                      variant={viewMode === 'measurements' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      Manual ({measurements.length})
                    </Button>
                    <Button
                      onClick={() => setViewMode('ai')}
                      variant={viewMode === 'ai' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      disabled={!analysisResults}
                    >
                      AI ({analysisResults?.totalElements || 0})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Measurements List */}
            {viewMode === 'measurements' && measurements.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Manual Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {measurements.map((measurement, index) => (
                      <div key={measurement.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: measurement.color }}
                            />
                            <span className="text-sm text-white">Line {index + 1}</span>
                          </div>
                          <span className="text-sm font-mono text-white">
                            {measurement.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Results */}
            {viewMode === 'ai' && analysisResults && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">AI Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{analysisResults.totalElements}</p>
                      <p className="text-sm text-gray-400">Elements Detected</p>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {analysisResults.elements.map((element, index) => (
                        <div key={element.id} className="p-2 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getElementColor(element.type) }}
                              />
                              <span className="text-sm text-white capitalize">{element.type}</span>
                            </div>
                            <span className="text-sm font-mono text-purple-400">
                              {element.length.toFixed(0)}mm
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-600">
                      <p className="text-xs text-gray-400">
                        Confidence: {(analysisResults.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Quick Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>1. Upload your PDF drawing</p>
                  <p>2. Set page size and scale</p>
                  <p>3. Use manual measurement or AI analysis</p>
                  <p>4. Export your results</p>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
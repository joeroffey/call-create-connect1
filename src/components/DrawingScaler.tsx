import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Download,
  FileText,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle
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

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState('');
  const [scale, setScale] = useState('');
  const [pdfImageUrl, setPdfImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);

    try {
      if (file.type === 'application/pdf') {
        const imageUrl = await processPDF(file);
        setPdfImageUrl(imageUrl);
      } else {
        throw new Error('Please upload a PDF file.');
      }
      
      toast({
        title: "File Uploaded",
        description: "PDF uploaded successfully. Please set page size and scale, then click Analyze.",
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    }
  };

  const processPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toDataURL();
  };

  const analyzeDrawing = async () => {
    if (!uploadedFile || !pageSize || !scale) {
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
          scale,
          unit: 'mm'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setAnalysisResult(data);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.elements.length} measurable elements with ${data.summary.elementCounts.wall || 0} walls, ${data.summary.elementCounts.door || 0} doors, and ${data.summary.elementCounts.window || 0} windows.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze drawing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
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
    if (!analysisResult) {
      toast({
        title: "No Analysis",
        description: "Please analyze the drawing first.",
        variant: "destructive"
      });
      return;
    }

    const data = {
      fileName: uploadedFile?.name,
      pageSize,
      scale,
      analysisResult,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawing_analysis_${uploadedFile?.name || 'drawing'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
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
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-400" />
                <span>Drawing Scaler</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Upload PDF, set scale, get accurate measurements instantly
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* File Upload */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload PDF</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                        <p className="text-sm text-white">{uploadedFile.name}</p>
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

            {/* Drawing Properties */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Drawing Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Page Size</Label>
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
                  <Label className="text-white">Scale</Label>
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
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={analyzeDrawing}
                  disabled={!uploadedFile || !pageSize || !scale || isAnalyzing}
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
                      Analyze Drawing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Center Panel - PDF Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="text-white">Drawing with Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-white rounded-lg min-h-[600px] overflow-auto">
                  {pdfImageUrl ? (
                    <div className="relative">
                      <img 
                        src={pdfImageUrl} 
                        alt="PDF Drawing" 
                        className="w-full h-auto"
                      />
                      {/* Measurement Overlays */}
                      {analysisResult && (
                        <div className="absolute inset-0">
                          {analysisResult.elements.map((element) => (
                            <div key={element.id}>
                              {/* Draw measurement line */}
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
                                  strokeWidth="3"
                                  opacity="0.8"
                                />
                                {/* Measurement label */}
                                {element.realWorldMeasurement && (
                                  <text
                                    x={(element.coordinates.x1 + element.coordinates.x2) / 2}
                                    y={(element.coordinates.y1 + element.coordinates.y2) / 2 - 5}
                                    fill={getElementColor(element.type)}
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    className="bg-white/80 px-1 rounded"
                                  >
                                    {element.realWorldMeasurement.toFixed(0)}mm
                                  </text>
                                )}
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4" />
                        <p>Upload a PDF to see it here with measurements</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - Measurements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {analysisResult && (
              <>
                {/* Summary */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">{analysisResult.summary.totalElements}</p>
                      <p className="text-sm text-gray-400">Elements Found</p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(analysisResult.summary.elementCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getElementColor(type) }}
                            />
                            <span className="text-sm text-white capitalize">{type}s</span>
                          </div>
                          <span className="text-sm text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Measurements List */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">All Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {analysisResult.elements
                          .filter(el => el.realWorldMeasurement)
                          .map((element, index) => (
                          <div key={element.id} className="p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: getElementColor(element.type) }}
                                />
                                <span className="text-sm text-white capitalize">{element.type}</span>
                              </div>
                              <span className="text-sm font-mono text-blue-400">
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

                {/* Export */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <Button
                      onClick={exportResults}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {!analysisResult && uploadedFile && pageSize && scale && !isAnalyzing && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ready to analyze! Click "Analyze Drawing" to detect measurements.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        </div>

        {/* Analysis Status Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-gray-800/95 border-gray-700">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-white font-medium">Analyzing drawing...</p>
                <p className="text-sm text-gray-400 mt-1">
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
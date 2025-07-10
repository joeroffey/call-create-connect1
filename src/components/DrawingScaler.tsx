import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Ruler, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Eye,
  MousePointer,
  FileText,
  Brain,
  Scale,
  Target,
  Layers,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Canvas as FabricCanvas, Circle, Line, FabricImage, Rect } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { Input } from '@/components/ui/input';
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

interface InputData {
  pageSize: string;
  scale: string;
  unit: 'mm' | 'cm' | 'inches' | 'feet';
}

const DrawingScaler = ({ onBack }: DrawingScalerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputData, setInputData] = useState<InputData>({
    pageSize: '',
    scale: '',
    unit: 'mm'
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'annotated'>('original');
  const [selectedElement, setSelectedElement] = useState<DetectedElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [scaleFactor, setScaleFactor] = useState<number>(0);
  
  const { toast } = useToast();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);

    // Handle element clicks
    canvas.on('mouse:down', (e) => {
      if (!analysisResult || viewMode !== 'annotated') return;
      
      const pointer = canvas.getPointer(e.e);
      const clickedElement = findElementAtPoint(pointer.x, pointer.y);
      
      if (clickedElement) {
        setSelectedElement(clickedElement);
        highlightElement(clickedElement);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [analysisResult, viewMode]);

  // Calculate scale factor when inputs change
  useEffect(() => {
    if (inputData.scale && inputData.pageSize) {
      const factor = calculateScaleFactor(inputData.scale, inputData.pageSize, inputData.unit);
      setScaleFactor(factor);
    }
  }, [inputData]);

  const calculateScaleFactor = (scale: string, pageSize: string, unit: string): number => {
    // Parse scale (e.g., "1:100" means 1 unit on drawing = 100 units in reality)
    const scaleMatch = scale.match(/1:(\d+)/);
    if (!scaleMatch) return 0;
    
    const scaleRatio = parseInt(scaleMatch[1]);
    
    // Get page dimensions in mm
    const pageDimensions: Record<string, number> = {
      'A4': 210, // A4 width in mm
      'A3': 297,
      'A2': 420,
      'A1': 594,
      'A0': 841,
      'Letter': 216, // 8.5 inches in mm
      'Legal': 216,
      'Tabloid': 279 // 11 inches in mm
    };
    
    const pageWidthMm = pageDimensions[pageSize] || 210;
    
    // Convert to desired unit
    const unitConversion = {
      'mm': 1,
      'cm': 0.1,
      'inches': 0.0393701,
      'feet': 0.00328084
    };
    
    const pageWidthInUnit = pageWidthMm * unitConversion[unit];
    
    // Assuming canvas width represents the page width
    const pixelsPerUnit = 800 / (pageWidthInUnit * scaleRatio);
    
    return 1 / pixelsPerUnit; // Convert from pixels to real-world units
  };

  const findElementAtPoint = (x: number, y: number): DetectedElement | null => {
    if (!analysisResult) return null;
    
    const tolerance = 10;
    return analysisResult.elements.find(element => {
      const { x1, y1, x2, y2 } = element.coordinates;
      
      // Check if point is near the line/element
      const distance = distanceToLine(x, y, x1, y1, x2, y2);
      return distance <= tolerance;
    }) || null;
  };

  const distanceToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    if (param < 0) {
      return Math.sqrt(A * A + B * B);
    } else if (param > 1) {
      const dx = px - x2;
      const dy = py - y2;
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      const dx = px - (x1 + param * C);
      const dy = py - (y1 + param * D);
      return Math.sqrt(dx * dx + dy * dy);
    }
  };

  const highlightElement = (element: DetectedElement) => {
    if (!fabricCanvas) return;

    // Clear previous highlights
    fabricCanvas.getObjects().forEach(obj => {
      if ((obj as any).name === 'highlight') {
        fabricCanvas.remove(obj);
      }
    });

    // Add highlight
    const highlight = new Line(
      [element.coordinates.x1, element.coordinates.y1, element.coordinates.x2, element.coordinates.y2],
      {
        stroke: '#ef4444',
        strokeWidth: 4,
        selectable: false,
        evented: false
      }
    );

    (highlight as any).name = 'highlight';
    fabricCanvas.add(highlight);
    fabricCanvas.renderAll();
  };

  const handleFileUpload = async (file: File) => {
    if (!fabricCanvas) return;

    setIsLoading(true);
    setUploadedFile(file);

    try {
      if (file.type === 'application/pdf') {
        await processPDF(file);
      } else if (file.type.startsWith('image/')) {
        await processImage(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processPDF = async (file: File) => {
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

    const imgUrl = canvas.toDataURL();
    await loadImageToCanvas(imgUrl);
  };

  const processImage = async (file: File) => {
    const imgUrl = URL.createObjectURL(file);
    await loadImageToCanvas(imgUrl);
  };

  const loadImageToCanvas = async (imgUrl: string) => {
    if (!fabricCanvas) return;

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        fabricCanvas.clear();

        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        const imgAspect = img.width / img.height;
        const canvasAspect = canvasWidth / canvasHeight;

        let scale;
        if (imgAspect > canvasAspect) {
          scale = canvasWidth / img.width;
        } else {
          scale = canvasHeight / img.height;
        }

        FabricImage.fromURL(img.src).then((fabricImg) => {
          fabricImg.set({
            scaleX: scale,
            scaleY: scale,
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
          });
          fabricCanvas.add(fabricImg);
          fabricCanvas.renderAll();
          resolve();
        }).catch(reject);
      };
      img.onerror = reject;
      img.src = imgUrl;
    });
  };

  const analyzeDrawing = async () => {
    if (!uploadedFile || !inputData.pageSize || !inputData.scale) {
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
          pageSize: inputData.pageSize,
          scale: inputData.scale,
          unit: inputData.unit
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setAnalysisResult(data);
      setViewMode('annotated');
      renderAnnotations(data.elements);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.elements.length} elements. Click on elements to see measurements.`,
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

  const renderAnnotations = (elements: DetectedElement[]) => {
    if (!fabricCanvas) return;

    // Remove existing annotations
    fabricCanvas.getObjects().forEach(obj => {
      if ((obj as any).name === 'annotation') {
        fabricCanvas.remove(obj);
      }
    });

    // Add element annotations
    elements.forEach(element => {
      const color = getElementColor(element.type);
      
      const line = new Line(
        [element.coordinates.x1, element.coordinates.y1, element.coordinates.x2, element.coordinates.y2],
        {
          stroke: color,
          strokeWidth: 2,
          selectable: false,
          evented: false,
          opacity: 0.8
        }
      );

      (line as any).name = 'annotation';
      fabricCanvas.add(line);

      // Add measurement if available
      if (element.measurement && scaleFactor > 0) {
        const realMeasurement = element.measurement * scaleFactor;
        const midX = (element.coordinates.x1 + element.coordinates.x2) / 2;
        const midY = (element.coordinates.y1 + element.coordinates.y2) / 2;

        // Add measurement circle
        const circle = new Circle({
          left: midX - 8,
          top: midY - 8,
          radius: 8,
          fill: color,
          selectable: false,
          evented: false
        });

        (circle as any).name = 'annotation';
        fabricCanvas.add(circle);
      }
    });

    fabricCanvas.renderAll();
  };

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

  const handleZoom = (zoomIn: boolean) => {
    if (!fabricCanvas) return;
    
    const newZoom = zoomIn ? zoom * 1.2 : zoom / 1.2;
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
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
      inputData,
      scaleFactor,
      analysisResult: {
        ...analysisResult,
        elements: analysisResult.elements.map(el => ({
          ...el,
          realMeasurement: el.measurement ? el.measurement * scaleFactor : undefined
        }))
      },
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
              variant="outline"
              size="sm"
              onClick={onBack}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                Smart Drawing Analyzer
              </h1>
              <p className="text-gray-400">AI-powered architectural drawing analysis and measurement</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Brain className="w-3 h-3 mr-1" />
            ProMax Only
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* File Upload */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Drawing
                </CardTitle>
                <CardDescription>
                  Upload PDF or image files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.svg"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black"
                >
                  {isLoading ? "Processing..." : "Select File"}
                </Button>
                
                {uploadedFile && (
                  <div className="text-sm text-gray-400">
                    <FileText className="w-4 h-4 inline mr-2" />
                    {uploadedFile.name}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Input Data */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Drawing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Size</Label>
                  <Select value={inputData.pageSize} onValueChange={(value) => setInputData(prev => ({ ...prev, pageSize: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                      <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                      <SelectItem value="A2">A2 (420×594mm)</SelectItem>
                      <SelectItem value="A1">A1 (594×841mm)</SelectItem>
                      <SelectItem value="A0">A0 (841×1189mm)</SelectItem>
                      <SelectItem value="Letter">Letter (8.5×11")</SelectItem>
                      <SelectItem value="Legal">Legal (8.5×14")</SelectItem>
                      <SelectItem value="Tabloid">Tabloid (11×17")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Scale</Label>
                  <Select value={inputData.scale} onValueChange={(value) => setInputData(prev => ({ ...prev, scale: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:50">1:50</SelectItem>
                      <SelectItem value="1:100">1:100</SelectItem>
                      <SelectItem value="1:200">1:200</SelectItem>
                      <SelectItem value="1:500">1:500</SelectItem>
                      <SelectItem value="1:1000">1:1000</SelectItem>
                      <SelectItem value="1:2000">1:2000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={inputData.unit} onValueChange={(value) => setInputData(prev => ({ ...prev, unit: value as any }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">Millimeters (mm)</SelectItem>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                      <SelectItem value="inches">Inches (in)</SelectItem>
                      <SelectItem value="feet">Feet (ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={analyzeDrawing}
                  disabled={isAnalyzing || !uploadedFile || !inputData.pageSize || !inputData.scale}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Drawing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* View Controls */}
            {analysisResult && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-pink-300 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    View Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant={viewMode === 'original' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('original')}
                      className="flex-1"
                    >
                      Original
                    </Button>
                    <Button
                      variant={viewMode === 'annotated' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('annotated')}
                      className="flex-1"
                    >
                      Annotated
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleZoom(true)}
                      className="flex-1 border-gray-600 text-gray-300"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleZoom(false)}
                      className="flex-1 border-gray-600 text-gray-300"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={exportResults}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Analysis
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Element Details */}
            {selectedElement && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-amber-300 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Element Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <Badge style={{ backgroundColor: getElementColor(selectedElement.type) }}>
                      {selectedElement.type}
                    </Badge>
                  </div>
                  
                  {selectedElement.measurement && scaleFactor > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Length:</span>
                      <span className="text-white font-medium">
                        {(selectedElement.measurement * scaleFactor).toFixed(2)} {inputData.unit}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white">
                      {Math.round(selectedElement.confidence * 100)}%
                    </span>
                  </div>
                  
                  {selectedElement.label && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Label:</span>
                      <span className="text-white">{selectedElement.label}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Elements List */}
            {analysisResult && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-emerald-300 flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    Detected Elements ({analysisResult.elements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {analysisResult.elements.map((element, index) => (
                        <div 
                          key={element.id} 
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            selectedElement?.id === element.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-750'
                          }`}
                          onClick={() => {
                            setSelectedElement(element);
                            highlightElement(element);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getElementColor(element.type) }}
                              />
                              <span className="text-sm font-medium capitalize">{element.type}</span>
                            </div>
                            {element.measurement && scaleFactor > 0 && (
                              <span className="text-xs text-gray-400">
                                {(element.measurement * scaleFactor).toFixed(1)} {inputData.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Drawing Canvas</span>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {analysisResult && (
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" />
                        Analyzed
                      </span>
                    )}
                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <canvas 
                    ref={canvasRef}
                    className="max-w-full"
                    style={{ cursor: analysisResult && viewMode === 'annotated' ? 'pointer' : 'default' }}
                  />
                </div>
                
                {!uploadedFile && (
                  <div className="text-center py-12 text-gray-400">
                    <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a drawing to start analyzing</p>
                  </div>
                )}

                {uploadedFile && !analysisResult && (
                  <div className="text-center py-12 text-gray-400">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Provide drawing information and click "Analyze Drawing"</p>
                  </div>
                )}

                {analysisResult && viewMode === 'annotated' && (
                  <Alert className="mt-4">
                    <MousePointer className="h-4 w-4" />
                    <AlertDescription>
                      Click on highlighted elements to see measurements and details.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingScaler;
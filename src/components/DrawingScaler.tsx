import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Ruler, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Settings,
  Target,
  FileText,
  Brain,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Canvas as FabricCanvas, Circle, Line, Point, FabricImage } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DrawingScalerProps {
  onBack: () => void;
}

interface MeasurementPoint {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  realWorldDistance: number;
  unit: string;
  pixelDistance: number;
}

interface ScaleInfo {
  detected: boolean;
  scaleText: string;
  scaleFactor: number;
  confidence: number;
}

const DrawingScaler = ({ onBack }: DrawingScalerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [scaleInfo, setScaleInfo] = useState<ScaleInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementStart, setMeasurementStart] = useState<MeasurementPoint | null>(null);
  const [customScaleInstruction, setCustomScaleInstruction] = useState('');
  const [zoom, setZoom] = useState(1);
  
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

    // Handle canvas clicks for measurement
    canvas.on('mouse:down', (e) => {
      if (!isMeasuring || !e.pointer) return;

      const point: MeasurementPoint = {
        x: e.pointer.x,
        y: e.pointer.y
      };

      if (!measurementStart) {
        // Start measurement
        setMeasurementStart(point);
        
        // Add start point indicator
        const startCircle = new Circle({
          left: point.x,
          top: point.y,
          radius: 5,
          fill: '#ef4444',
          selectable: false,
          evented: false,
        });
        canvas.add(startCircle);
        canvas.renderAll();
      } else {
        // End measurement
        const pixelDistance = Math.sqrt(
          Math.pow(point.x - measurementStart.x, 2) + 
          Math.pow(point.y - measurementStart.y, 2)
        );

        // Add measurement line
        const line = new Line([measurementStart.x, measurementStart.y, point.x, point.y], {
          stroke: '#ef4444',
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });

        // Add end point indicator
        const endCircle = new Circle({
          left: point.x,
          top: point.y,
          radius: 5,
          fill: '#ef4444',
          selectable: false,
          evented: false,
        });

        canvas.add(line);
        canvas.add(endCircle);
        canvas.renderAll();

        // Calculate real-world measurement if scale is available
        if (scaleInfo?.scaleFactor) {
          const realWorldDistance = pixelDistance * scaleInfo.scaleFactor;
          
          const newMeasurement: Measurement = {
            id: Date.now().toString(),
            start: measurementStart,
            end: point,
            realWorldDistance,
            unit: 'mm',
            pixelDistance
          };

          setMeasurements(prev => [...prev, newMeasurement]);
          
          toast({
            title: "Measurement Added",
            description: `Distance: ${realWorldDistance.toFixed(2)} mm`,
          });
        } else {
          toast({
            title: "Scale Required",
            description: "Please calibrate the drawing scale first.",
            variant: "destructive"
          });
        }

        // Reset measurement state
        setMeasurementStart(null);
        setIsMeasuring(false);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [isMeasuring, measurementStart, scaleInfo]);

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

      // Trigger AI analysis
      await analyzeDrawingScale(file);
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
    const page = await pdf.getPage(1); // Process first page

    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert to image and add to Fabric canvas
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
        // Clear canvas
        fabricCanvas.clear();

        // Calculate scaling to fit canvas
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

        // Create fabric image object
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

  const analyzeDrawingScale = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Convert file to base64 for API
      const base64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke('analyze-drawing-scale', {
        body: { 
          image: base64,
          customInstruction: customScaleInstruction 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setScaleInfo(data.scaleInfo);
      
      if (data.scaleInfo.detected) {
        toast({
          title: "Scale Detected!",
          description: `Found scale: ${data.scaleInfo.scaleText} (Confidence: ${Math.round(data.scaleInfo.confidence * 100)}%)`,
        });
      } else {
        toast({
          title: "No Scale Detected",
          description: "You can manually set the scale or provide instructions.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scale analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze drawing scale. Please try again.",
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
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
    });
  };

  const startMeasurement = () => {
    if (!scaleInfo?.detected) {
      toast({
        title: "Scale Required",
        description: "Please detect or set the drawing scale first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsMeasuring(true);
    setMeasurementStart(null);
    
    toast({
      title: "Measurement Mode",
      description: "Click two points to measure distance.",
    });
  };

  const handleZoom = (zoomIn: boolean) => {
    if (!fabricCanvas) return;
    
    const newZoom = zoomIn ? zoom * 1.2 : zoom / 1.2;
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const exportMeasurements = () => {
    if (measurements.length === 0) {
      toast({
        title: "No Measurements",
        description: "Add some measurements before exporting.",
        variant: "destructive"
      });
      return;
    }

    const data = {
      fileName: uploadedFile?.name,
      scaleInfo,
      measurements: measurements.map(m => ({
        distance: `${m.realWorldDistance.toFixed(2)} ${m.unit}`,
        pixelDistance: m.pixelDistance.toFixed(2),
        startPoint: m.start,
        endPoint: m.end
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurements_${uploadedFile?.name || 'drawing'}.json`;
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
                Drawing Scaler
              </h1>
              <p className="text-gray-400">AI-powered precision measurement tool</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Brain className="w-3 h-3 mr-1" />
            ProMax Only
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload & Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* File Upload */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Drawing
                </CardTitle>
                <CardDescription>
                  Upload PDF or image files of architectural drawings
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

            {/* Scale Detection */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Scale Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scaleInfo?.detected ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="text-emerald-400 font-medium">
                      Scale Detected: {scaleInfo.scaleText}
                    </div>
                    <div className="text-sm text-gray-400">
                      Confidence: {Math.round(scaleInfo.confidence * 100)}%
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="text-amber-400">
                      No scale detected automatically
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="scale-instruction">Custom Scale Instruction</Label>
                  <Input
                    id="scale-instruction"
                    placeholder="e.g., 'scale 1:100', 'print on A2 at 1.2×'"
                    value={customScaleInstruction}
                    onChange={(e) => setCustomScaleInstruction(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <Button
                  onClick={() => uploadedFile && analyzeDrawingScale(uploadedFile)}
                  disabled={isAnalyzing || !uploadedFile}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Scale"}
                </Button>
              </CardContent>
            </Card>

            {/* Measurement Controls */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center">
                  <Ruler className="w-5 h-5 mr-2" />
                  Measurement Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={startMeasurement}
                  disabled={!scaleInfo?.detected || isMeasuring}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {isMeasuring ? "Click Two Points" : "Start Measuring"}
                </Button>

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
                  onClick={exportMeasurements}
                  disabled={measurements.length === 0}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </CardContent>
            </Card>

            {/* Measurements List */}
            {measurements.length > 0 && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-emerald-300">Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {measurements.map((measurement, index) => (
                      <div key={measurement.id} className="p-2 bg-gray-800 rounded text-sm">
                        <div className="text-emerald-400 font-medium">
                          #{index + 1}: {measurement.realWorldDistance.toFixed(2)} {measurement.unit}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {measurement.pixelDistance.toFixed(1)} pixels
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="text-sm text-gray-400">
                    Zoom: {Math.round(zoom * 100)}%
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <canvas 
                    ref={canvasRef}
                    className="max-w-full"
                    style={{ cursor: isMeasuring ? 'crosshair' : 'default' }}
                  />
                </div>
                
                {!uploadedFile && (
                  <div className="text-center py-12 text-gray-400">
                    <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a drawing to start measuring</p>
                  </div>
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
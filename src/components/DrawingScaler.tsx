import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Download, FileText, Smartphone } from "lucide-react";

interface DrawingScalerProps {
  onBack: () => void;
}

const DrawingScaler: React.FC<DrawingScalerProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [targetSize, setTargetSize] = useState('A4');
  const [scaleInput, setScaleInput] = useState('1:100');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [measurementStyle, setMeasurementStyle] = useState('overlay');

  // File upload handler
  const handleFileUpload = (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    setUploadedFile(file);
    setProcessedPdfUrl(null);
  };

  // Process drawing with AI
  const processDrawing = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a PDF file first');
      return;
    }

    if (!targetSize || !scaleInput) {
      toast.error('Please specify target size and scale');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('targetSize', targetSize);
      formData.append('scale', scaleInput);
      formData.append('measurementStyle', measurementStyle);
      formData.append('instructions', additionalInstructions);

      const { data, error } = await supabase.functions.invoke('process-drawing-scale', {
        body: formData
      });

      if (error) {
        console.error('Error processing drawing:', error);
        toast.error('Failed to process drawing');
        return;
      }

      if (data.processedPdfUrl) {
        setProcessedPdfUrl(data.processedPdfUrl);
        toast.success('Drawing processed successfully!');
      }
    } catch (error) {
      console.error('Error processing drawing:', error);
      toast.error('Error processing drawing');
    } finally {
      setIsLoading(false);
    }
  };

  // Download processed PDF
  const downloadProcessedPdf = () => {
    if (processedPdfUrl) {
      const a = document.createElement('a');
      a.href = processedPdfUrl;
      a.download = `scaled-drawing-${Date.now()}.pdf`;
      a.click();
      toast.success('Download started');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Drawing Scaler</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            AI-powered PDF scaling with measurements for mobile use
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload and Input Panel */}
          <div className="space-y-4">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Drawing (PDF)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? uploadedFile.name : 'Click to upload PDF drawing'}
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </CardContent>
            </Card>

            {/* Processing Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-size">Target Size</Label>
                    <Select value={targetSize} onValueChange={setTargetSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                        <SelectItem value="A2">A2 (420 × 594 mm)</SelectItem>
                        <SelectItem value="A1">A1 (594 × 841 mm)</SelectItem>
                        <SelectItem value="Letter">Letter (216 × 279 mm)</SelectItem>
                        <SelectItem value="Legal">Legal (216 × 356 mm)</SelectItem>
                        <SelectItem value="Mobile">Mobile Optimized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scale-input">Drawing Scale</Label>
                    <Input
                      id="scale-input"
                      placeholder="e.g., 1:100, 1:50, 2:1"
                      value={scaleInput}
                      onChange={(e) => setScaleInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="measurement-style">Measurement Style</Label>
                    <Select value={measurementStyle} onValueChange={setMeasurementStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select measurement style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overlay">Overlay on Drawing</SelectItem>
                        <SelectItem value="sidebar">Separate Text List</SelectItem>
                        <SelectItem value="both">Both Overlay and List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Additional Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any specific requirements or areas to focus on..."
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={processDrawing}
                    disabled={!uploadedFile || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Processing Drawing...' : 'Process Drawing'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Processed Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedPdfUrl ? (
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4 bg-muted/50">
                      <h3 className="font-semibold mb-2">Scaled Drawing Ready</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your drawing has been processed with the specified scale and measurements.
                        The output is optimized for mobile viewing.
                      </p>
                      
                      <Button
                        onClick={downloadProcessedPdf}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Scaled PDF
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Measurements included as specified</p>
                      <p>• Mobile-optimized layout</p>
                      <p>• High-quality vector output</p>
                      <p>• Ready for field use</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">
                          AI is processing your drawing...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload a PDF and configure parameters to get started
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Features Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Optimized for phone/tablet viewing</p>
                  <p>• Touch-friendly measurement annotations</p>
                  <p>• High-contrast text for outdoor use</p>
                  <p>• Scalable vector output</p>
                  <p>• Offline-ready PDF format</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingScaler;
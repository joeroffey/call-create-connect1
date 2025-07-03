import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, Image, FileCheck, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompletionDocuments } from '@/hooks/useCompletionDocuments';

interface CompletionDocsUploadProps {
  projectId: string;
  teamId: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

const categories = [
  { value: 'building-control', label: 'Building Control' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'warranties', label: 'Warranties' },
  { value: 'approved-documents', label: 'Approved Documents' },
  { value: 'other', label: 'Other' },
];

const allowedFileTypes = [
  // Images
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  // CAD/Drawing files
  'application/dxf',
  'application/dwg',
  'image/vnd.dwg',
];

const maxFileSize = 10 * 1024 * 1024; // 10MB

export const CompletionDocsUpload = ({
  projectId,
  teamId,
  onClose,
  onUploadComplete,
}: CompletionDocsUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentNames, setDocumentNames] = useState<{ [key: string]: string }>({});
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { uploadDocument } = useCompletionDocuments(projectId);

  const validateFile = (file: File): string | null => {
    if (!allowedFileTypes.includes(file.type)) {
      return `${file.name}: Unsupported file type. Please upload images, PDFs, Word docs, Excel files, or CAD drawings.`;
    }
    if (file.size > maxFileSize) {
      return `${file.name}: File too large. Maximum size is 10MB.`;
    }
    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const newErrors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        newFiles.push(file);
        // Initialize document name with file name (without extension)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setDocumentNames(prev => ({ ...prev, [file.name]: nameWithoutExt }));
      }
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setErrors(newErrors);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = (index: number) => {
    const fileName = selectedFiles[index]?.name;
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileName) {
      setDocumentNames(prev => {
        const newNames = { ...prev };
        delete newNames[fileName];
        return newNames;
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !category) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const displayName = documentNames[file.name] || file.name;
        await uploadDocument(file, category, description, displayName);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return FileCheck;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden mx-auto top-[2vh] translate-y-0 sm:top-[50%] sm:translate-y-[-50%]">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg">Upload Completion Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-base sm:text-lg font-medium text-foreground mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              Images, PDFs, Word docs, Excel files, and CAD drawings up to 10MB
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm">Choose Files</Button>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Selected Files with Document Names */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Selected Files ({selectedFiles.length})</Label>
              <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs text-muted-foreground truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Document Name Input */}
                      <div className="space-y-1">
                        <Label htmlFor={`doc-name-${index}`} className="text-xs">
                          Document Name *
                        </Label>
                        <Input
                          id={`doc-name-${index}`}
                          value={documentNames[file.name] || ''}
                          onChange={(e) => setDocumentNames(prev => ({ ...prev, [file.name]: e.target.value }))}
                          placeholder="Enter document name..."
                          disabled={uploading}
                          className="h-8 text-sm"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={uploading}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for these documents..."
              disabled={uploading}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading documents...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                selectedFiles.length === 0 || 
                !category || 
                uploading ||
                selectedFiles.some(file => !documentNames[file.name]?.trim())
              }
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Eye, Trash2, FileText, Image, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCompletionDocuments, type CompletionDocument } from '@/hooks/useCompletionDocuments';

interface CompletionDocsViewerProps {
  document: CompletionDocument;
  onClose: () => void;
}

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
};

export const CompletionDocsViewer = ({ document, onClose }: CompletionDocsViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { deleteDocument, getDocumentUrl } = useCompletionDocuments(document.project_id);

  const fileUrl = getDocumentUrl(document.file_path);
  const isImage = document.file_type.startsWith('image/');
  const isPDF = document.file_type === 'application/pdf';

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(document.id);
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold pr-8">
                {document.file_name}
              </DialogTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">
                  {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(document.file_size)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(document.created_at)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Description */}
          {document.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{document.description}</p>
            </div>
          )}

          {/* Document Preview */}
          <div className="border rounded-lg overflow-hidden">
            {isImage && !imageError ? (
              <div className="relative">
                <img
                  src={fileUrl}
                  alt={document.file_name}
                  className="w-full h-auto max-h-[600px] object-contain bg-muted"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : isPDF ? (
              <div className="h-[600px] w-full">
                <iframe
                  src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-full"
                  title={document.file_name}
                />
              </div>
            ) : (
              <div className="p-12 text-center bg-muted/50">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Preview not available
                </h3>
                <p className="text-muted-foreground mb-4">
                  This file type cannot be previewed in the browser.
                </p>
                <Button onClick={handleDownload} disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>

          {/* Error handling for images */}
          {isImage && imageError && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Unable to load image preview. You can still download the file to view it.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-3">
              <Button onClick={handleDownload} disabled={loading} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {(isImage || isPDF) && (
                <Button
                  onClick={() => window.open(fileUrl, '_blank')}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Open in new tab
                </Button>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{document.file_name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
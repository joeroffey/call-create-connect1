
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Eye, Trash2, FileText, Image, AlertCircle, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompletionDocuments, type CompletionDocument } from '@/hooks/useCompletionDocuments';
import { EditDocumentModal } from './EditDocumentModal';
import { DocumentComments } from './DocumentComments';
import { ErrorBoundary } from './ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';

interface CompletionDocsViewerProps {
  isOpen: boolean;
  document: CompletionDocument;
  onClose: () => void;
  onDelete?: () => void;
}

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
};

export const CompletionDocsViewer = ({ isOpen, document, onClose, onDelete }: CompletionDocsViewerProps) => {
  console.log('CompletionDocsViewer rendering with document:', {
    id: document?.id,
    file_name: document?.file_name,
    team_id: document?.team_id,
    idType: typeof document?.id,
    teamIdType: typeof document?.team_id
  });
  
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { deleteDocument, getDocumentUrl } = useCompletionDocuments(document.project_id);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.error('Error getting current user:', error);
        setCurrentUserId(null);
      }
    };
    getCurrentUser();
  }, []);

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
      onDelete?.(); // Trigger refresh in parent component
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] h-[95vh] flex flex-col overflow-hidden" aria-describedby="document-description">
          <DialogHeader className="flex-shrink-0 border-b pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base sm:text-lg font-semibold pr-8 break-words line-clamp-2">
                  {document.file_name}
                </DialogTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <Badge variant="secondary" className="w-fit">
                    {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(document.file_size)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatDate(document.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="space-y-4 p-1">
              {/* Document Description */}
              {document.description && (
                <div id="document-description" className="flex-shrink-0 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
              )}

              {/* Document Preview */}
              <div className="border rounded-lg overflow-hidden bg-background">
                {isImage && !imageError ? (
                  <div className="relative bg-muted p-4">
                    <img
                      src={fileUrl}
                      alt={document.file_name}
                      className="w-full h-auto object-contain rounded-lg shadow-sm"
                      onError={() => setImageError(true)}
                      style={{ maxHeight: 'none' }}
                    />
                  </div>
                ) : isPDF ? (
                  <div className="w-full" style={{ height: '80vh' }}>
                    <iframe
                      src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      className="w-full h-full border-0"
                      title={document.file_name}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center p-6 text-center bg-muted/50">
                    <div>
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-base font-medium text-foreground mb-2">
                        Preview not available
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This file type cannot be previewed in the browser.
                      </p>
                      <Button onClick={handleDownload} disabled={loading} size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download to view
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error handling for images */}
              {isImage && imageError && (
                <Alert className="flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Unable to load image preview. You can still download the file to view it.
                  </AlertDescription>
                </Alert>
              )}

              {/* Comments Section */}
              <div className="border-t pt-4">
                {document?.id && document?.team_id ? (
                  <DocumentComments 
                    documentId={String(document.id)}
                    teamId={String(document.team_id)}
                    currentUserId={currentUserId || undefined}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">Comments not available - missing document information.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t pt-4 mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleDownload} disabled={loading} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[90vw] max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription className="break-words">
                      Are you sure you want to delete "{document.file_name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {showEditModal && (
        <EditDocumentModal
          document={document}
          onClose={() => setShowEditModal(false)}
          onDocumentUpdated={onDelete} // Reuse the refresh callback
        />
      )}
    </>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Eye, Download, Building, Award, Shield, FileCheck, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type CompletionDocument, useCompletionDocuments } from '@/hooks/useCompletionDocuments';

interface CompletionDocsListProps {
  documents: CompletionDocument[];
  loading: boolean;
  onViewDocument: (document: CompletionDocument) => void;
}

const categoryIcons = {
  'building-control': Building,
  'certificates': Award,
  'warranties': Shield,
  'approved-documents': FileCheck,
  'other': FileText,
};

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
};

const categoryColors = {
  'building-control': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'certificates': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'warranties': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'approved-documents': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export const CompletionDocsList = ({ documents, loading, onViewDocument }: CompletionDocsListProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // Use a dummy project ID to access getDocumentUrl function
  const { getDocumentUrl } = useCompletionDocuments(documents[0]?.project_id);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    return FileText;
  };

  const handleImageError = (documentId: string) => {
    setImageErrors(prev => new Set(prev).add(documentId));
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Documents Found</h3>
          <p className="text-muted-foreground">
            Upload completion documents like building control certificates, warranties, and approved drawings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document, index) => {
        const FileIcon = getFileIcon(document.file_type);
        const CategoryIcon = categoryIcons[document.category as keyof typeof categoryIcons] || FileText;
        const categoryColor = categoryColors[document.category as keyof typeof categoryColors] || categoryColors.other;
        const isImage = document.file_type.startsWith('image/');
        const hasImageError = imageErrors.has(document.id);

        return (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
              <CardContent className="p-0">
                {/* Thumbnail Area */}
                <div className="h-32 sm:h-36 relative bg-muted/50 border-b">
                  {isImage && !hasImageError ? (
                    <img
                      src={getDocumentUrl(document.file_path)}
                      alt={document.file_name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(document.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <FileIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {document.file_type.split('/')[1] || 'FILE'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge Overlay */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className={`text-xs ${categoryColor} shadow-sm`}>
                      {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
                    </Badge>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm leading-tight line-clamp-2 mb-1" title={document.file_name}>
                      {document.file_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(document.file_size)}
                    </p>
                  </div>

                  {document.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDocument(document)}
                      className="w-full"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
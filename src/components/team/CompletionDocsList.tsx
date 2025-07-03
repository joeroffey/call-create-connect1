import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type CompletionDocument } from '@/hooks/useCompletionDocuments';
import { getCompletionDocumentUrl, formatFileSize, isImageFile, getFileExtension } from '@/utils/documentUtils';

interface CompletionDocsListProps {
  documents: CompletionDocument[];
  loading: boolean;
  onViewDocument: (document: CompletionDocument) => void;
}

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
} as const;

export const CompletionDocsList = ({ documents, loading, onViewDocument }: CompletionDocsListProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (documentId: string) => {
    setImageErrors(prev => new Set(prev).add(documentId));
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
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <div className="p-4 space-y-3">
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
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
          <p className="text-muted-foreground text-sm">
            Upload completion documents like building control certificates, warranties, and approved drawings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full overflow-hidden">
      {documents.map((document, index) => {
        const isImage = isImageFile(document.file_type);
        const hasImageError = imageErrors.has(document.id);
        const documentUrl = getCompletionDocumentUrl(document.file_path);

        return (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-border/50 hover:border-primary/20 w-full"
              onClick={() => onViewDocument(document)}
            >
              <CardContent className="p-0 w-full">
                {/* Thumbnail Area */}
                <div className="h-48 relative bg-gradient-to-br from-muted/30 to-muted/60 w-full">
                  {isImage && !hasImageError ? (
                    <img
                      src={documentUrl}
                      alt={document.file_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => handleImageError(document.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-background/80 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground/80 uppercase tracking-wider">
                            {getFileExtension(document.file_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(document.file_size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="default" className="text-xs shadow-sm">
                      {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
                    </Badge>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <Eye className="w-5 h-5 text-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-medium text-base leading-tight line-clamp-2 text-foreground break-words" title={document.display_name || document.file_name}>
                      {document.display_name || document.file_name}
                    </h4>
                    {isImage && (
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(document.file_size)}
                      </p>
                    )}
                  </div>

                  {document.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {document.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      View →
                    </div>
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
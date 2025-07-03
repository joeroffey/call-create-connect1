import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Eye, Download, Building, Award, Shield, FileCheck, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type CompletionDocument } from '@/hooks/useCompletionDocuments';

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
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    return FileText;
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document, index) => {
        const FileIcon = getFileIcon(document.file_type);
        const CategoryIcon = categoryIcons[document.category as keyof typeof categoryIcons] || FileText;
        const categoryColor = categoryColors[document.category as keyof typeof categoryColors] || categoryColors.other;

        return (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate" title={document.file_name}>
                        {document.file_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.file_size)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CategoryIcon className="w-4 h-4" />
                  <Badge variant="secondary" className={`text-xs ${categoryColor}`}>
                    {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
                  </Badge>
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

                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDocument(document)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
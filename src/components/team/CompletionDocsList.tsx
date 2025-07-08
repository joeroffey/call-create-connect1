
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Calendar, MessageCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type CompletionDocument } from '@/hooks/useCompletionDocuments';
import { getCompletionDocumentUrl, formatFileSize, isImageFile, getFileExtension } from '@/utils/documentUtils';
import { useDocumentComments } from '@/hooks/useDocumentComments';
import { supabase } from '@/integrations/supabase/client';

interface CompletionDocsListProps {
  documents: CompletionDocument[];
  loading: boolean;
  onViewDocument: (document: CompletionDocument) => void;
}

interface UploaderProfile {
  user_id: string;
  full_name: string | null;
}

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
} as const;

const categoryColors = {
  'building-control': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'certificates': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'warranties': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'approved-documents': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'other': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
} as const;

const DocumentCard = ({ 
  document, 
  isImage, 
  hasImageError, 
  documentUrl, 
  uploaderName, 
  index, 
  onViewDocument, 
  onImageError
}: {
  document: CompletionDocument;
  isImage: boolean;
  hasImageError: boolean;
  documentUrl: string;
  uploaderName: string;
  index: number;
  onViewDocument: (doc: CompletionDocument) => void;
  onImageError: (id: string) => void;
}) => {
  const { commentCount } = useDocumentComments(document.id, document.team_id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-[1.02]"
        onClick={() => {
          try {
            console.log('Clicking on document:', document.file_name, 'ID:', document.id);
            if (document && document.id && document.team_id) {
              onViewDocument(document);
            } else {
              console.error('Invalid document data:', document);
            }
          } catch (error) {
            console.error('Error clicking document:', error);
          }
        }}
      >
        <CardContent className="p-0 w-full">
          {/* Thumbnail Area */}
          <div className="h-56 relative bg-gradient-to-br from-muted/20 to-muted/40 w-full overflow-hidden">
            {isImage && !hasImageError ? (
              <img
                src={documentUrl}
                alt={document.file_name}
                className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-110"
                onError={() => onImageError(document.id)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-background/90 rounded-3xl flex items-center justify-center mx-auto shadow-lg border border-border/50">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
                      {getFileExtension(document.file_type)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge 
                variant="secondary" 
                className={`text-xs font-medium shadow-sm border ${getCategoryColor(document.category)}`}
              >
                {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
              </Badge>
            </div>

            {/* User Badge */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                <User className="w-3 h-3" />
                <span className="font-medium">{uploaderName.split(' ')[0]}</span>
              </div>
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-border/50">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground break-words" title={document.display_name || document.file_name}>
                {document.display_name || document.file_name}
              </h4>
              {isImage && (
                <p className="text-sm text-muted-foreground font-medium">
                  {formatFileSize(document.file_size)}
                </p>
              )}
            </div>

            {document.description && (
              <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                {document.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  <span className="font-medium">{formatDate(document.created_at)}</span>
                </div>
                {commentCount > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <MessageCircle className="w-4 h-4 text-blue-500/70" />
                    <span className="font-medium">{commentCount}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-primary/80 bg-primary/10 px-3 py-1.5 rounded-full font-medium border border-primary/20">
                View Document
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const CompletionDocsList = ({ documents, loading, onViewDocument }: CompletionDocsListProps) => {
  console.log('CompletionDocsList rendered with:', { documents: documents?.length, loading });
  console.log('Documents data:', documents?.map(d => ({ id: d.id, name: d.file_name, team_id: d.team_id })));
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [uploaderProfiles, setUploaderProfiles] = useState<Map<string, UploaderProfile>>(new Map());

  const handleImageError = (documentId: string) => {
    setImageErrors(prev => new Set(prev).add(documentId));
  };

  // Fetch uploader profiles
  useEffect(() => {
    const fetchUploaderProfiles = async () => {
      if (documents.length === 0) return;

      const uploaderIds = [...new Set(documents.map(doc => doc.uploaded_by))];
      
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', uploaderIds);

        if (error) {
          console.error('Error fetching uploader profiles:', error);
          return;
        }

        const profilesMap = new Map<string, UploaderProfile>();
        profiles?.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
        
        setUploaderProfiles(profilesMap);
      } catch (error) {
        console.error('Error fetching uploader profiles:', error);
      }
    };

    fetchUploaderProfiles();
  }, [documents]);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-0 bg-card/30">
            <CardContent className="p-0">
              <div className="h-56 bg-muted/30 rounded-t-lg"></div>
              <div className="p-6 space-y-4">
                <div className="h-5 bg-muted/30 rounded w-3/4"></div>
                <div className="h-4 bg-muted/30 rounded w-1/2"></div>
                <div className="h-8 bg-muted/30 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted/50 bg-card/30">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">No Documents Found</h3>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            Upload completion documents like building control certificates, warranties, and approved drawings to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 w-full overflow-hidden">
      {documents.map((document, index) => {
        const isImage = isImageFile(document.file_type);
        const hasImageError = imageErrors.has(document.id);
        const documentUrl = getCompletionDocumentUrl(document.file_path);
        const uploaderProfile = uploaderProfiles.get(document.uploaded_by);
        const uploaderName = uploaderProfile?.full_name || 'Unknown User';

        return (
          <DocumentCard
            key={document.id}
            document={document}
            isImage={isImage}
            hasImageError={hasImageError}
            documentUrl={documentUrl}
            uploaderName={uploaderName}
            index={index}
            onViewDocument={onViewDocument}
            onImageError={handleImageError}
          />
        );
      })}
    </div>
  );
};

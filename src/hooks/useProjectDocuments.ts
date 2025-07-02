import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  project_id: string;
  user_id: string;
}

export const useProjectDocuments = (projectId: string | undefined, userId: string | undefined) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!projectId || !userId) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        variant: "destructive",
        title: "Error loading documents",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!projectId || !userId) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Project and user information required for document upload.",
      });
      return false;
    }

    // Validate file type
    const supportedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'application/json', 'application/xml'
    ];
    
    if (!supportedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Unsupported file type",
        description: "Please upload images, PDFs, Word documents, or text files.",
      });
      return false;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 50MB.",
      });
      return false;
    }

    setIsUploading(true);
    try {
      const filePath = `${userId}/${projectId}/${Date.now()}-${file.name}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { error: dbError } = await supabase
        .from('project_documents')
        .insert([
          {
            project_id: projectId,
            user_id: userId,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          }
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded to your project.`,
      });

      // Refresh documents list
      await fetchDocuments();
      return true;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Document deleted",
        description: "Document has been removed from your project.",
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete document. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId, userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId || !userId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel
    const channelName = `project-documents-${projectId}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_documents',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Document change detected:', payload);
          fetchDocuments();
        }
      );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId, userId]);

  return {
    documents,
    loading,
    isUploading,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
};
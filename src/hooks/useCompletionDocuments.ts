import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompletionDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  description?: string;
  uploaded_by: string;
  team_id: string;
  created_at: string;
  updated_at: string;
}

export const useCompletionDocuments = (projectId?: string | null) => {
  const [data, setData] = useState<CompletionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!projectId) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: documents, error: fetchError } = await supabase
        .from('project_completion_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(documents || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch completion documents';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    category: string,
    description?: string
  ): Promise<CompletionDocument | null> => {
    if (!projectId) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Get project details to get team_id
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      if (!project?.team_id) {
        throw new Error('Project is not associated with a team');
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-completion-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create document record
      const { data: document, error: createError } = await supabase
        .from('project_completion_documents')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          category,
          description,
          uploaded_by: user.id,
          team_id: project.team_id,
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      fetchDocuments(); // Refresh the list
      return document;
    } catch (err) {
      console.error('Upload error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('project_completion_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-completion-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: deleteError } = await supabase
        .from('project_completion_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });

      fetchDocuments(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getDocumentUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('project-completion-documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  return {
    data,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    refetch: fetchDocuments,
  };
};
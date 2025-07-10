
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
  display_name?: string;
  uploaded_by: string;
  team_id: string;
  folder_id?: string | null;
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
    description?: string,
    displayName?: string
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
      console.log('Starting upload process for:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user?.id, 'User error:', userError);
      if (!user) throw new Error('User not authenticated');

      // Get project details to get team_id
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', projectId)
        .single();

      console.log('Project query result:', { project, projectError });
      
      if (projectError) throw projectError;
      if (!project?.team_id) {
        throw new Error('Project is not associated with a team');
      }

      // Check if user is a team member
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', project.team_id)
        .eq('user_id', user.id)
        .single();

      console.log('Team member check:', { teamMember, teamError });
      if (teamError || !teamMember) {
        throw new Error('User is not a member of this team');
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      console.log('Attempting storage upload with path:', filePath);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-completion-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Storage upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Storage upload error details:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

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
          display_name: displayName || file.name,
          uploaded_by: user.id,
          team_id: project.team_id,
        })
        .select()
        .single();

      console.log('Database insert result:', { document, createError });

      if (createError) {
        console.error('Database insert error:', createError);
        throw new Error(`Database insert failed: ${createError.message}`);
      }

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

  const updateDocument = async (
    documentId: string,
    updates: {
      display_name?: string;
      category?: string;
      description?: string | null;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('project_completion_documents')
        .update(updates)
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });

      fetchDocuments(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
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
    updateDocument,
    deleteDocument,
    getDocumentUrl,
    refetch: fetchDocuments,
  };
};

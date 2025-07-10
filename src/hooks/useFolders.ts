import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompletionDocumentFolder {
  id: string;
  project_id: string;
  team_id: string;
  name: string;
  parent_folder_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useFolders = (projectId?: string, teamId?: string) => {
  const [folders, setFolders] = useState<CompletionDocumentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFolders = async () => {
    if (!projectId || !teamId) {
      setFolders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('completion_document_folders')
        .select('*')
        .eq('project_id', projectId)
        .eq('team_id', teamId)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setFolders(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch folders';
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

  const createFolder = async (name: string, parentFolderId?: string) => {
    if (!projectId || !teamId) return false;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('completion_document_folders')
        .insert({
          project_id: projectId,
          team_id: teamId,
          name,
          parent_folder_id: parentFolderId || null,
          created_by: user.data.user.id,
        });

      if (error) throw error;

      toast({
        title: 'Folder Created',
        description: `Folder "${name}" has been created successfully.`,
      });

      fetchFolders();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('completion_document_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      toast({
        title: 'Folder Deleted',
        description: 'Folder has been deleted successfully.',
      });

      fetchFolders();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete folder';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getRootFolders = () => {
    return folders.filter(folder => !folder.parent_folder_id);
  };

  const getSubFolders = (parentId: string) => {
    return folders.filter(folder => folder.parent_folder_id === parentId);
  };

  const getFolderPath = (folderId: string): CompletionDocumentFolder[] => {
    const path: CompletionDocumentFolder[] = [];
    let currentFolder = folders.find(f => f.id === folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.parent_folder_id 
        ? folders.find(f => f.id === currentFolder!.parent_folder_id)
        : undefined;
    }
    
    return path;
  };

  useEffect(() => {
    fetchFolders();
  }, [projectId, teamId]);

  return {
    folders,
    isLoading,
    error,
    createFolder,
    deleteFolder,
    getRootFolders,
    getSubFolders,
    getFolderPath,
    refetch: fetchFolders,
  };
};
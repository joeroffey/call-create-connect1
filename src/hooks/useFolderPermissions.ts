import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FolderPermission {
  id: string;
  folder_id: string;
  user_id: string;
  team_id: string;
  permission_level: 'view' | 'upload' | 'admin';
  granted_by: string;
  granted_at: string;
  created_at: string;
  updated_at: string;
}

export const useFolderPermissions = (folderId?: string) => {
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    if (!folderId) {
      setPermissions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('folder_permissions')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPermissions((data || []) as FolderPermission[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch folder permissions';
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

  const grantPermission = async (
    userId: string,
    teamId: string,
    permissionLevel: 'view' | 'upload' | 'admin'
  ) => {
    if (!folderId) return false;

    try {
      const { error } = await supabase
        .from('folder_permissions')
        .upsert({
          folder_id: folderId,
          user_id: userId,
          team_id: teamId,
          permission_level: permissionLevel,
          granted_by: (await supabase.auth.getUser()).data.user?.id || '',
        });

      if (error) throw error;

      toast({
        title: 'Permission Updated',
        description: 'Folder access permission has been updated successfully.',
      });

      fetchPermissions();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update permission';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const revokePermission = async (userId: string) => {
    if (!folderId) return false;

    try {
      const { error } = await supabase
        .from('folder_permissions')
        .delete()
        .eq('folder_id', folderId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Permission Revoked',
        description: 'Folder access has been revoked successfully.',
      });

      fetchPermissions();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke permission';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [folderId]);

  return {
    permissions,
    isLoading,
    error,
    grantPermission,
    revokePermission,
    refetch: fetchPermissions,
  };
};
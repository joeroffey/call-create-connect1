import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectPermission {
  id: string;
  project_id: string;
  user_id: string;
  team_id: string;
  permission_level: 'view' | 'edit' | 'admin';
  granted_by: string;
  granted_at: string;
  created_at: string;
  updated_at: string;
}

export const useProjectPermissions = (projectId?: string) => {
  const [permissions, setPermissions] = useState<ProjectPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    if (!projectId) {
      setPermissions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('project_permissions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPermissions((data || []) as ProjectPermission[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project permissions';
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
    permissionLevel: 'view' | 'edit' | 'admin'
  ) => {
    if (!projectId) return false;

    try {
      const { error } = await supabase
        .from('project_permissions')
        .upsert({
          project_id: projectId,
          user_id: userId,
          team_id: teamId,
          permission_level: permissionLevel,
          granted_by: (await supabase.auth.getUser()).data.user?.id || '',
        });

      if (error) throw error;

      toast({
        title: 'Permission Updated',
        description: 'Project access permission has been updated successfully.',
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
    if (!projectId) return false;

    try {
      const { error } = await supabase
        .from('project_permissions')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Permission Revoked',
        description: 'Project access has been revoked successfully.',
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
  }, [projectId]);

  return {
    permissions,
    isLoading,
    error,
    grantPermission,
    revokePermission,
    refetch: fetchPermissions,
  };
};
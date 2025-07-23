import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
  team_id?: string;
  team_name?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
}

export const useProjects = (userId: string, workspaceContext: 'personal' | 'team' | 'all' = 'all', teamId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First get user's team IDs
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);
      
      const userTeamIds = teamMembers?.map(tm => tm.team_id) || [];
      
      // Build query based on workspace context
      let query = supabase
        .from('projects')
        .select(`
          *,
          teams!left(
            id,
            name
          )
        `);
      
      // Filter based on workspace context
      if (workspaceContext === 'personal') {
        query = query.eq('user_id', userId).is('team_id', null);
      } else if (workspaceContext === 'team' && teamId) {
        query = query.eq('team_id', teamId);
      } else if (workspaceContext === 'team' && userTeamIds.length > 0) {
        query = query.in('team_id', userTeamIds);
      } else if (workspaceContext === 'all') {
        if (userTeamIds.length > 0) {
          query = query.or(`user_id.eq.${userId},team_id.in.(${userTeamIds.join(',')})`);
        } else {
          query = query.eq('user_id', userId);
        }
      } else {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Process projects to include team name
      const processedProjects = (data || []).map(project => ({
        ...project,
        team_name: project.teams?.name || null
      }));
      
      // Sort projects: pinned first, then by updated_at
      const sortedProjects = processedProjects.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setProjects(sortedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userId, workspaceContext, teamId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createProject = async (projectData: any) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project created successfully",
        description: `${projectData.name} has been added to your projects.`,
      });

      fetchProjects();
      return data;
    } catch (err: any) {
      console.error('Error creating project:', err);
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: err.message || "Please try again.",
      });
      throw err;
    }
  };

  const updateProject = async (projectId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project updated successfully",
        description: "Project has been updated.",
      });

      fetchProjects();
    } catch (err: any) {
      console.error('Error updating project:', err);
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: err.message || "Please try again.",
      });
      throw err;
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated conversations and documents.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: `${projectName} has been deleted.`,
      });

      fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      toast({
        variant: "destructive",
        title: "Error deleting project",
        description: err.message || "Please try again.",
      });
      throw err;
    }
  };

  const togglePinProject = async (projectId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ pinned: !currentPinned })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: !currentPinned ? "Project pinned" : "Project unpinned",
        description: !currentPinned ? "Project moved to top of list" : "Project unpinned from top",
      });

      fetchProjects();
    } catch (err: any) {
      console.error('Error toggling pin:', err);
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: err.message || "Please try again.",
      });
      throw err;
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      const statusLabel = newStatus === 'planning' ? 'Set-up' : newStatus.replace('-', ' ');
      toast({
        title: "Status updated",
        description: `Project status changed to ${statusLabel}.`,
      });

      fetchProjects();
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: err.message || "Please try again.",
      });
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    togglePinProject,
    handleStatusChange,
    refetch: fetchProjects
  };
};
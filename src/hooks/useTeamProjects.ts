import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface TeamProject {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
  team_id: string;
  team_name: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  creator_name?: string;
  creator_email?: string;
}

export const useTeamProjects = (teamId: string | null, teamName: string = '') => {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamProjects = async () => {
    if (!teamId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First, get the projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('team_id', teamId)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Get unique user IDs from projects
      const userIds = [...new Set(projectsData?.map(p => p.user_id) || [])];
      
      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const processedProjects = (projectsData || []).map(project => {
        const profile = profilesMap.get(project.user_id);
        return {
          ...project,
          team_name: teamName,
          creator_name: profile?.full_name || 'Unknown User',
          creator_email: project.user_id
        };
      });
      
      // Sort projects: pinned first, then by updated_at
      const sortedProjects = processedProjects.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setProjects(sortedProjects);
    } catch (error: any) {
      console.error('Error fetching team projects:', error);
      setError(error.message || 'Failed to load team projects');
      toast({
        variant: "destructive",
        title: "Error loading team projects",
        description: error.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: { 
    name: string; 
    description: string; 
    label: string; 
    user_id: string;
    customer_name?: string;
    customer_address?: string;
    customer_phone?: string;
  }) => {
    if (!teamId) throw new Error('No team ID provided');

    const { error } = await supabase
      .from('projects')
      .insert([{
        user_id: projectData.user_id,
        team_id: teamId,
        name: projectData.name.trim(),
        description: projectData.description.trim() || null,
        label: projectData.label,
        status: 'setup',
        customer_name: projectData.customer_name?.trim() || null,
        customer_address: projectData.customer_address?.trim() || null,
        customer_phone: projectData.customer_phone?.trim() || null
      }]);

    if (error) throw error;
    
    toast({
      title: "Team project created successfully",
      description: `${projectData.name} has been added to ${teamName}.`,
    });
    
    fetchTeamProjects();
  };

  const updateProject = async (projectId: string, updates: Partial<TeamProject>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) throw error;
    
    toast({
      title: "Project updated successfully",
      description: `Project has been updated.`,
    });
    
    fetchTeamProjects();
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    
    toast({
      title: "Project deleted",
      description: `${projectName} has been deleted.`,
    });
    
    fetchTeamProjects();
  };

  const togglePinProject = async (projectId: string, currentPinned: boolean) => {
    const { error } = await supabase
      .from('projects')
      .update({ pinned: !currentPinned })
      .eq('id', projectId);

    if (error) throw error;
    
    toast({
      title: !currentPinned ? "Project pinned" : "Project unpinned",
      description: !currentPinned ? "Project moved to top of list" : "Project unpinned from top",
    });
    
    fetchTeamProjects();
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (error) throw error;
    
    const statusLabel = newStatus === 'setup' ? 'Set-up' : newStatus.replace('-', ' ');
    toast({
      title: "Status updated",
      description: `Project status changed to ${statusLabel}.`,
    });
    
    fetchTeamProjects();
  };

  useEffect(() => {
    fetchTeamProjects();
  }, [teamId]);

  // Set up real-time subscription for team projects
  useEffect(() => {
    if (!teamId) return;

    const channel = supabase
      .channel(`team-projects-${teamId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `team_id=eq.${teamId}`,
      }, () => {
        fetchTeamProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    togglePinProject,
    handleStatusChange,
    refetch: fetchTeamProjects
  };
};
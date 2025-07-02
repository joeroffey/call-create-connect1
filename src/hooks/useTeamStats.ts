import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamStats {
  memberCount: number;
  projectCount: number;
  activeTaskCount: number;
  loading: boolean;
}

export const useTeamStats = (teamId: string | null) => {
  const [stats, setStats] = useState<TeamStats>({
    memberCount: 0,
    projectCount: 0,
    activeTaskCount: 0,
    loading: true
  });

  useEffect(() => {
    if (!teamId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStats = async () => {
      setStats(prev => ({ ...prev, loading: true }));
      
      try {
        // Fetch member count
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamId);

        if (membersError) throw membersError;

        // Fetch project count
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .eq('team_id', teamId);

        if (projectsError) throw projectsError;

        // Fetch active task count from team projects
        const { data: tasks, error: tasksError } = await supabase
          .from('project_schedule_of_works')
          .select('id')
          .eq('completed', false)
          .in('project_id', projects?.map(p => p.id) || []);

        if (tasksError) throw tasksError;

        setStats({
          memberCount: members?.length || 0,
          projectCount: projects?.length || 0,
          activeTaskCount: tasks?.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching team stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();

    // Set up real-time subscriptions
    const membersChannel = supabase
      .channel('team-members-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members',
        filter: `team_id=eq.${teamId}`
      }, fetchStats)
      .subscribe();

    const projectsChannel = supabase
      .channel('team-projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `team_id=eq.${teamId}`
      }, fetchStats)
      .subscribe();

    const tasksChannel = supabase
      .channel('team-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_schedule_of_works'
      }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [teamId]);

  return stats;
};
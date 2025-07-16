import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamStats {
  memberCount: number;
  projectCount: number;
  activeTaskCount: number;
  completedTaskCount: number;
  commentCount: number;
  totalActivityCount: number;
  actionsToday: number;
  actionsThisWeek: number;
  actionsThisMonth: number;
  loading: boolean;
}

export const useTeamStats = (teamId: string | null) => {
  const [stats, setStats] = useState<TeamStats>({
    memberCount: 0,
    projectCount: 0,
    activeTaskCount: 0,
    completedTaskCount: 0,
    commentCount: 0,
    totalActivityCount: 0,
    actionsToday: 0,
    actionsThisWeek: 0,
    actionsThisMonth: 0,
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
        const { data: activeTasks, error: activeTasksError } = await supabase
          .from('project_schedule_of_works')
          .select('id')
          .eq('completed', false)
          .in('project_id', projects?.map(p => p.id) || []);

        if (activeTasksError) throw activeTasksError;

        // Fetch completed task count from team projects
        const { data: completedTasks, error: completedTasksError } = await supabase
          .from('project_schedule_of_works')
          .select('id')
          .eq('completed', true)
          .in('project_id', projects?.map(p => p.id) || []);

        if (completedTasksError) throw completedTasksError;

        // Fetch comment count for the team
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('id')
          .eq('team_id', teamId);

        if (commentsError) throw commentsError;

        // Fetch total activity count
        const { data: totalActivity, error: activityError } = await supabase
          .from('team_activity')
          .select('id')
          .eq('team_id', teamId);

        if (activityError) throw activityError;

        // Fetch activity counts for different time periods
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const { data: todayActivity, error: todayError } = await supabase
          .from('team_activity')
          .select('id')
          .eq('team_id', teamId)
          .gte('created_at', today.toISOString());

        if (todayError) throw todayError;

        const { data: weekActivity, error: weekError } = await supabase
          .from('team_activity')
          .select('id')
          .eq('team_id', teamId)
          .gte('created_at', weekStart.toISOString());

        if (weekError) throw weekError;

        const { data: monthActivity, error: monthError } = await supabase
          .from('team_activity')
          .select('id')
          .eq('team_id', teamId)
          .gte('created_at', monthStart.toISOString());

        if (monthError) throw monthError;

        setStats({
          memberCount: members?.length || 0,
          projectCount: projects?.length || 0,
          activeTaskCount: activeTasks?.length || 0,
          completedTaskCount: completedTasks?.length || 0,
          commentCount: comments?.length || 0,
          totalActivityCount: totalActivity?.length || 0,
          actionsToday: todayActivity?.length || 0,
          actionsThisWeek: weekActivity?.length || 0,
          actionsThisMonth: monthActivity?.length || 0,
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

    const commentsChannel = supabase
      .channel('team-comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `team_id=eq.${teamId}`
      }, fetchStats)
      .subscribe();

    const activityChannel = supabase
      .channel('team-activity-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_activity',
        filter: `team_id=eq.${teamId}`
      }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [teamId]);

  return stats;
};
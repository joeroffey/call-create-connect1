import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamActivity {
  id: string;
  user_id: string;
  team_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: any;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

export const useTeamActivity = (teamId: string | null) => {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('useTeamActivity effect triggered:', { teamId, hasTeamId: !!teamId });
    if (!teamId) return;

    const fetchTeamActivity = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_activity')
          .select(`
            id,
            user_id,
            team_id,
            action,
            target_type,
            target_id,
            metadata,
            created_at
          `)
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Fetch user profiles separately
        const userIds = [...new Set(data?.map(activity => activity.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        // Combine data with profiles
        const activitiesWithProfiles = data?.map(activity => ({
          ...activity,
          profiles: profiles?.find(p => p.user_id === activity.user_id) || null
        })) || [];

        console.log('Team activities fetched in main effect:', {
          teamId,
          activitiesCount: activitiesWithProfiles.length,
          activities: activitiesWithProfiles,
          rawData: data
        });

        setActivities(activitiesWithProfiles);
      } catch (error) {
        console.error('Error fetching team activity:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamActivity();

    // Set up real-time subscription for team activity
    const channel = supabase
      .channel(`team-activity-${teamId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_activity',
        filter: `team_id=eq.${teamId}`,
      }, () => {
        console.log('Real-time team activity update detected');
        fetchTeamActivity();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const addActivity = async (
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: any
  ) => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('team_activity')
        .insert({
          user_id: user.id,
          team_id: teamId,
          action,
          target_type: targetType || null,
          target_id: targetId || null,
          metadata: metadata || null,
        });

      if (error) throw error;
      
      // Refresh activities after adding
      const { data } = await supabase
        .from('team_activity')
        .select(`
          id,
          user_id,
          team_id,
          action,
          target_type,
          target_id,
          metadata,
          created_at
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        // Fetch user profiles separately
        const userIds = [...new Set(data.map(activity => activity.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        // Combine data with profiles
        const activitiesWithProfiles = data.map(activity => ({
          ...activity,
          profiles: profiles?.find(p => p.user_id === activity.user_id) || null
        }));

        console.log('Team activities fetched:', {
          teamId,
          activitiesCount: activitiesWithProfiles.length,
          activities: activitiesWithProfiles
        });

        setActivities(activitiesWithProfiles);
      }
    } catch (error) {
      console.error('Error adding team activity:', error);
    }
  };

  return {
    activities,
    loading,
    addActivity,
  };
};
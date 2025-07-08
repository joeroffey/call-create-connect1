import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  target_id: string | null;
  target_type: string | null;
  metadata: any;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export const useTeamActivity = (teamId: string | undefined, enabled: boolean = true) => {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!teamId || !enabled) {
      setLoading(false);
      return;
    }

    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('team_activity')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Get user profiles separately to avoid relation issues
      const userIds = [...new Set((data || []).map(activity => activity.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const activitiesWithUserInfo = (data || []).map(activity => ({
        ...activity,
        user_name: profilesMap.get(activity.user_id)?.full_name || 'Unknown User',
        user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`
      })) as TeamActivity[];
      
      setActivities(activitiesWithUserInfo);
    } catch (error: any) {
      console.error('Error fetching team activities:', error);
      setError(error.message || 'Failed to load team activities');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, targetId?: string, targetType?: string, metadata?: any) => {
    if (!teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: user.id,
          action,
          target_id: targetId || null,
          target_type: targetType || null,
          metadata: metadata || null
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging team activity:', error);
    }
  };

  const getRecentActivities = (limit: number = 10) => {
    return activities.slice(0, limit);
  };

  const getActivitiesByType = (type: string) => {
    return activities.filter(activity => activity.target_type === type);
  };

  useEffect(() => {
    if (enabled) {
      fetchActivities();
    }
  }, [teamId, enabled]);

  // Set up real-time subscription
  useEffect(() => {
    if (!teamId || !enabled) return;

    const setupSubscription = async () => {
      try {
        // Clean up existing channel if it exists
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create new channel with unique name
        const channelName = `team-activity-${teamId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const channel = supabase.channel(channelName);

        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'team_activity',
              filter: `team_id=eq.${teamId}`,
            },
            (payload) => {
              console.log('Team activity change detected:', payload);
              fetchActivities();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to team activity changes');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Error subscribing to team activity changes');
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Error setting up team activity subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up team activity subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [teamId, enabled]);

  return {
    activities,
    loading,
    error,
    logActivity,
    getRecentActivities,
    getActivitiesByType,
    refreshActivities: fetchActivities
  };
};
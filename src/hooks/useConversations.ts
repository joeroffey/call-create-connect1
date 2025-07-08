
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
}

export const useConversations = (userId: string | undefined, enabled: boolean = true) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectCounts, setProjectCounts] = useState<{[key: string]: {documents: number, scheduleOfWorks: number}}>({});
  const channelRef = useRef<any>(null);

  const fetchConversations = async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at, project_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      setError(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectCounts = async () => {
    if (!userId || !enabled) return;

    try {
      // First get all projects the user can access (own projects + team projects)
      const { data: accessibleProjects, error: projectError } = await supabase
        .from('projects')
        .select('id, team_id')
        .or(`user_id.eq.${userId},team_id.in.(${await getUserTeamIds()})`);

      if (projectError) throw projectError;

      const counts: {[key: string]: {documents: number, scheduleOfWorks: number}} = {};
      
      for (const project of accessibleProjects || []) {
        // Initialize count for this project
        counts[project.id] = { documents: 0, scheduleOfWorks: 0 };

        // For team projects, get data from all team members; for personal projects, only current user
        if (project.team_id) {
          // Team project - get data from all team members
          const { data: documents } = await supabase
            .from('project_documents')
            .select('id')
            .eq('project_id', project.id);

          const { data: scheduleItems } = await supabase
            .from('project_schedule_of_works')
            .select('id')
            .eq('project_id', project.id);

          counts[project.id].documents = documents?.length || 0;
          counts[project.id].scheduleOfWorks = scheduleItems?.length || 0;
        } else {
          // Personal project - filter by user_id
          const { data: documents } = await supabase
            .from('project_documents')
            .select('id')
            .eq('project_id', project.id)
            .eq('user_id', userId);

          const { data: scheduleItems } = await supabase
            .from('project_schedule_of_works')
            .select('id')
            .eq('project_id', project.id)
            .eq('user_id', userId);

          counts[project.id].documents = documents?.length || 0;
          counts[project.id].scheduleOfWorks = scheduleItems?.length || 0;
        }
      }

      setProjectCounts(counts);
    } catch (error: any) {
      console.error('Error fetching project counts:', error);
      setError(error.message || 'Failed to load project counts');
    }
  };

  // Helper function to get user's team IDs
  const getUserTeamIds = async (): Promise<string> => {
    try {
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);
      
      const teamIds = teamMembers?.map(tm => tm.team_id) || [];
      return teamIds.length > 0 ? teamIds.join(',') : 'null';
    } catch (error) {
      console.error('Error fetching team IDs:', error);
      return 'null';
    }
  };

  // Optimistic update functions
  const incrementDocumentCount = (projectId: string) => {
    setProjectCounts(prev => ({
      ...prev,
      [projectId]: {
        documents: (prev[projectId]?.documents || 0) + 1,
        scheduleOfWorks: prev[projectId]?.scheduleOfWorks || 0
      }
    }));
  };

  const incrementScheduleCount = (projectId: string) => {
    setProjectCounts(prev => ({
      ...prev,
      [projectId]: {
        documents: prev[projectId]?.documents || 0,
        scheduleOfWorks: (prev[projectId]?.scheduleOfWorks || 0) + 1
      }
    }));
  };

  useEffect(() => {
    if (enabled) {
      fetchConversations();
      fetchProjectCounts();
    }
  }, [userId, enabled]);

  // Set up real-time subscription to conversations - with proper cleanup
  useEffect(() => {
    if (!userId || !enabled) return;

    const setupSubscription = async () => {
      try {
        // Clean up existing channel if it exists
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create new channel with unique name including timestamp to avoid conflicts
        const channelName = `conversations-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const channel = supabase.channel(channelName);

        // Configure the channel with all event listeners
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'conversations',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Conversation change detected:', payload);
              fetchConversations();
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'project_documents',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Document change detected:', payload);
              fetchProjectCounts();
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'project_schedule_of_works',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Schedule of works change detected:', payload);
              fetchProjectCounts();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to conversations changes');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Error subscribing to conversations changes');
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Error setting up conversations subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up conversations subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, enabled]);

  const refreshConversations = () => {
    fetchConversations();
    fetchProjectCounts();
  };

  // Helper function to get conversation count by project
  const getProjectConversationCount = (projectId: string) => {
    return conversations.filter(conv => conv.project_id === projectId).length;
  };

  // Helper functions to get document and schedule of works counts
  const getProjectDocumentCount = (projectId: string) => {
    return projectCounts[projectId]?.documents || 0;
  };

  const getProjectScheduleOfWorksCount = (projectId: string) => {
    return projectCounts[projectId]?.scheduleOfWorks || 0;
  };

  return {
    conversations,
    loading,
    error,
    refreshConversations,
    getProjectConversationCount,
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount,
    incrementDocumentCount,
    incrementScheduleCount
  };
};

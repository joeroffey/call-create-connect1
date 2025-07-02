
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
}

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectCounts, setProjectCounts] = useState<{[key: string]: {documents: number, scheduleOfWorks: number}}>({});
  const channelRef = useRef<any>(null);

  const fetchConversations = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at, project_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectCounts = async () => {
    if (!userId) return;

    try {
      // Fetch document counts
      const { data: documents, error: docError } = await supabase
        .from('project_documents')
        .select('project_id')
        .eq('user_id', userId);

      if (docError) throw docError;

      // Fetch schedule of works counts
      const { data: scheduleItems, error: scheduleError } = await supabase
        .from('project_schedule_of_works')
        .select('project_id')
        .eq('user_id', userId);

      if (scheduleError) throw scheduleError;

      // Count by project
      const counts: {[key: string]: {documents: number, scheduleOfWorks: number}} = {};
      
      documents?.forEach(doc => {
        if (!counts[doc.project_id]) counts[doc.project_id] = { documents: 0, scheduleOfWorks: 0 };
        counts[doc.project_id].documents++;
      });

      scheduleItems?.forEach(item => {
        if (!counts[item.project_id]) counts[item.project_id] = { documents: 0, scheduleOfWorks: 0 };
        counts[item.project_id].scheduleOfWorks++;
      });

      setProjectCounts(counts);
    } catch (error) {
      console.error('Error fetching project counts:', error);
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
    fetchConversations();
    fetchProjectCounts();
  }, [userId]);

  // Set up real-time subscription to conversations - with proper cleanup
  useEffect(() => {
    if (!userId) return;

    const setupSubscription = async () => {
      try {
        // Clean up existing channel if it exists
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create new channel with unique name including timestamp to avoid conflicts
        const channelName = `conversations-${userId}-${Date.now()}`;
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
  }, [userId]);

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
    refreshConversations,
    getProjectConversationCount,
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount,
    incrementDocumentCount,
    incrementScheduleCount
  };
};


import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
}

// Global refs to prevent multiple subscriptions across hook instances
let globalChannel: any = null;
let globalUserId: string | null = null;
let subscribersCount = 0;

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectCounts, setProjectCounts] = useState<{[key: string]: {documents: number, milestones: number}}>({});
  const mountedRef = useRef(true);

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
      
      console.log('Fetched conversations:', data);
      if (mountedRef.current) {
        setConversations(data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
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

      // Fetch milestone counts
      const { data: milestones, error: milestoneError } = await supabase
        .from('project_milestones')
        .select('project_id')
        .eq('user_id', userId);

      if (milestoneError) throw milestoneError;

      // Count by project
      const counts: {[key: string]: {documents: number, milestones: number}} = {};
      
      documents?.forEach(doc => {
        if (!counts[doc.project_id]) counts[doc.project_id] = { documents: 0, milestones: 0 };
        counts[doc.project_id].documents++;
      });

      milestones?.forEach(milestone => {
        if (!counts[milestone.project_id]) counts[milestone.project_id] = { documents: 0, milestones: 0 };
        counts[milestone.project_id].milestones++;
      });

      if (mountedRef.current) {
        setProjectCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching project counts:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchProjectCounts();
  }, [userId]);

  // Set up real-time subscription with global management
  useEffect(() => {
    if (!userId) return;

    // Increment subscriber count
    subscribersCount++;
    console.log('Subscribers count:', subscribersCount);

    // Only create subscription if we don't have one or user changed
    if (!globalChannel || globalUserId !== userId) {
      // Clean up existing subscription if user changed
      if (globalChannel && globalUserId !== userId) {
        console.log('User changed, cleaning up existing subscription');
        try {
          supabase.removeChannel(globalChannel);
        } catch (error) {
          console.log('Error removing old channel:', error);
        }
        globalChannel = null;
      }

      globalUserId = userId;
      const channelName = `user-${userId}-changes-${Date.now()}`;
      console.log('Creating new global channel:', channelName);
      
      globalChannel = supabase
        .channel(channelName)
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
            // Refetch for all subscribers
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
            table: 'project_milestones',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('Milestone change detected:', payload);
            fetchProjectCounts();
          }
        )
        .subscribe((status) => {
          console.log('Global subscription status:', status);
        });
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      subscribersCount--;
      console.log('Subscribers count after cleanup:', subscribersCount);
      
      // Only cleanup global subscription when no more subscribers
      if (subscribersCount === 0 && globalChannel) {
        console.log('No more subscribers, cleaning up global subscription');
        try {
          supabase.removeChannel(globalChannel);
        } catch (error) {
          console.log('Error removing global channel:', error);
        }
        globalChannel = null;
        globalUserId = null;
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

  // Helper functions to get document and milestone counts
  const getProjectDocumentCount = (projectId: string) => {
    return projectCounts[projectId]?.documents || 0;
  };

  const getProjectMilestoneCount = (projectId: string) => {
    return projectCounts[projectId]?.milestones || 0;
  };

  return {
    conversations,
    loading,
    refreshConversations,
    getProjectConversationCount,
    getProjectDocumentCount,
    getProjectMilestoneCount
  };
};

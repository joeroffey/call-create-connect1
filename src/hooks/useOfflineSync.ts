import { useEffect } from 'react';
import { useOffline } from './useOffline';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseOfflineSyncOptions {
  projectId?: string;
  userId?: string;
}

export const useOfflineSync = (options: UseOfflineSyncOptions = {}) => {
  const { isOnline, storeDataOffline, getOfflineData } = useOffline();
  const { projectId, userId } = options;

  // Sync projects data
  const syncProjects = async () => {
    if (!userId) return;

    try {
      if (isOnline) {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId);

        if (!error && projects) {
          await storeDataOffline('projects', projects);
        }
      }
    } catch (error) {
      console.error('Failed to sync projects:', error);
    }
  };

  // Sync schedule data
  const syncSchedules = async () => {
    if (!projectId) return;

    try {
      if (isOnline) {
        const { data: schedules, error } = await supabase
          .from('project_schedule_of_works')
          .select('*')
          .eq('project_id', projectId);

        if (!error && schedules) {
          await storeDataOffline('schedules', schedules);
        }
      }
    } catch (error) {
      console.error('Failed to sync schedules:', error);
    }
  };

  // Sync conversations data
  const syncConversations = async () => {
    if (!userId) return;

    try {
      if (isOnline) {
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userId);

        if (!error && conversations) {
          await storeDataOffline('conversations', conversations);
        }
      }
    } catch (error) {
      console.error('Failed to sync conversations:', error);
    }
  };

  // Get offline projects
  const getOfflineProjects = async () => {
    const data = await getOfflineData();
    return data.projects || [];
  };

  // Get offline schedules
  const getOfflineSchedules = async () => {
    const data = await getOfflineData();
    return data.schedules?.filter(schedule => 
      !projectId || schedule.project_id === projectId
    ) || [];
  };

  // Get offline conversations
  const getOfflineConversations = async () => {
    const data = await getOfflineData();
    return data.conversations || [];
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && (userId || projectId)) {
      const syncData = async () => {
        try {
          await Promise.all([
            syncProjects(),
            syncSchedules(),
            syncConversations()
          ]);
          
          toast({
            title: "Data Synced",
            description: "Your offline changes have been synchronized.",
          });
        } catch (error) {
          console.error('Sync failed:', error);
          toast({
            title: "Sync Failed",
            description: "Some changes couldn't be synchronized. Please try again.",
            variant: "destructive",
          });
        }
      };

      syncData();
    }
  }, [isOnline, userId, projectId]);

  return {
    isOnline,
    syncProjects,
    syncSchedules,
    syncConversations,
    getOfflineProjects,
    getOfflineSchedules,
    getOfflineConversations
  };
};
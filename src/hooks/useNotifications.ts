import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  team_id: string;
  project_id: string;
  type: 'task_assigned' | 'document_uploaded' | 'task_completed';
  title: string;
  message: string;
  target_id: string | null;
  target_type: 'task' | 'document' | null;
  read: boolean;
  created_at: string;
  metadata: any;
}

export const useNotifications = (userId: string | undefined, enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications((data || []) as Notification[]);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Optimistic update
      setNotifications(prev => prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read.",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Optimistic update
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        read: true
      })));

      toast({
        title: "All notifications marked as read",
        description: `${unreadIds.length} notifications updated.`,
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read.",
      });
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getRecentNotifications = (limit: number = 5) => {
    return notifications.slice(0, limit);
  };

  useEffect(() => {
    if (enabled) {
      fetchNotifications();
    }
  }, [userId, enabled]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId || !enabled) return;

    const setupSubscription = async () => {
      try {
        // Clean up existing channel if it exists
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create new channel with unique name
        const channelName = `notifications-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const channel = supabase.channel(channelName);

        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Notification change detected:', payload);
              
              // Show toast for new notifications
              if (payload.eventType === 'INSERT') {
                const newNotification = payload.new as Notification;
                toast({
                  title: newNotification.title,
                  description: newNotification.message,
                  duration: 5000,
                });
              }
              
              fetchNotifications();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to notifications changes');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Error subscribing to notifications changes');
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Error setting up notifications subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up notifications subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, enabled]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getNotificationsByType,
    getRecentNotifications,
    refreshNotifications: fetchNotifications
  };
};
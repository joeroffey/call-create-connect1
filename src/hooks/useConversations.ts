
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at')
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

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const refreshConversations = () => {
    fetchConversations();
  };

  return {
    conversations,
    loading,
    refreshConversations
  };
};

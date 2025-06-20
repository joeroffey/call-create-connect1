
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export const useConversationMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async (convId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, role, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type cast the role field to ensure it matches our interface
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, images: string[] = []) => {
    if (!conversationId) return;

    try {
      // Add user message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user'
        });

      if (error) throw error;

      // Refresh messages to show the new one
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const refreshMessages = () => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  return { messages, loading, sendMessage, refreshMessages };
};

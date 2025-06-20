
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
      
      console.log('Loaded messages for conversation:', convId, typedMessages);
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, images: string[] = []) => {
    if (!conversationId) {
      console.error('No conversation ID provided for sending message');
      return;
    }

    console.log('Sending message to conversation:', conversationId, content);

    try {
      // Add user message to database
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user'
        })
        .select()
        .single();

      if (userError) throw userError;

      console.log('User message inserted:', userMessage);

      // Immediately add user message to UI
      const newUserMessage: Message = {
        id: userMessage.id,
        content: userMessage.content,
        role: 'user' as const,
        created_at: userMessage.created_at
      };

      setMessages(prev => {
        const updated = [...prev, newUserMessage];
        console.log('Updated messages with user message:', updated);
        return updated;
      });

      // Simulate AI response for now (you can replace this with actual AI API call)
      setTimeout(async () => {
        try {
          const aiResponse = "Thank you for your question about building regulations. I'm here to help with construction advice, building codes, and project guidance.";
          
          const { data: aiMessage, error: aiError } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              content: aiResponse,
              role: 'assistant'
            })
            .select()
            .single();

          if (aiError) throw aiError;

          console.log('AI message inserted:', aiMessage);

          const newAiMessage: Message = {
            id: aiMessage.id,
            content: aiMessage.content,
            role: 'assistant' as const,
            created_at: aiMessage.created_at
          };

          setMessages(prev => {
            const updated = [...prev, newAiMessage];
            console.log('Updated messages with AI message:', updated);
            return updated;
          });
        } catch (error) {
          console.error('Error sending AI response:', error);
        }
      }, 1000);

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
    console.log('Conversation ID changed:', conversationId);
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      console.log('No conversation ID, clearing messages');
      setMessages([]);
    }
  }, [conversationId]);

  console.log('Current messages state:', messages);

  return { messages, loading, sendMessage, refreshMessages };
};

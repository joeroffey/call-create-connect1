import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageFeedback {
  id?: string;
  message_id: string;
  conversation_id: string;
  user_id: string;
  feedback_type: 'thumbs_up' | 'thumbs_down' | 'helpful' | 'not_helpful';
  feedback_text?: string;
}

export const useMessageFeedback = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (feedback: Omit<MessageFeedback, 'user_id'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('message_feedback')
        .upsert({
          ...feedback,
          user_id: user.id,
        }, {
          onConflict: 'message_id,user_id'
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted",
        description: "Thank you for helping us improve!",
      });

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting feedback:', error);
      return null;
    }
  };

  return {
    submitFeedback,
    getFeedback,
    loading,
  };
};
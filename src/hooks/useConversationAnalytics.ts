import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationAnalytics {
  conversation_id: string;
  user_id: string;
  project_id?: string;
  resolved?: boolean;
  satisfaction_score?: number;
  time_to_resolution?: number;
  total_messages?: number;
  ai_messages?: number;
  user_messages?: number;
  follow_up_questions?: number;
  pinecone_matches_used?: number;
  avg_pinecone_confidence?: number;
}

export const useConversationAnalytics = (conversationId: string | null) => {
  const [analytics, setAnalytics] = useState<ConversationAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const updateAnalytics = async (updates: Partial<ConversationAnalytics>) => {
    if (!conversationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_analytics')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          ...updates,
        }, {
          onConflict: 'conversation_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation analytics:', error);
    }
  };

  const incrementMessageCount = async (role: 'user' | 'assistant') => {
    if (!conversationId) return;

    try {
      const { data: current } = await supabase
        .from('conversation_analytics')
        .select('total_messages, ai_messages, user_messages')
        .eq('conversation_id', conversationId)
        .maybeSingle();

      const updates = {
        total_messages: (current?.total_messages || 0) + 1,
        ai_messages: role === 'assistant' ? (current?.ai_messages || 0) + 1 : current?.ai_messages || 0,
        user_messages: role === 'user' ? (current?.user_messages || 0) + 1 : current?.user_messages || 0,
      };

      await updateAnalytics(updates);
    } catch (error) {
      console.error('Error incrementing message count:', error);
    }
  };

  const markResolved = async (satisfactionScore?: number) => {
    await updateAnalytics({
      resolved: true,
      satisfaction_score: satisfactionScore,
    });
  };

  const trackPineconeUsage = async (matchesUsed: number, avgConfidence: number) => {
    try {
      const { data: current } = await supabase
        .from('conversation_analytics')
        .select('pinecone_matches_used, avg_pinecone_confidence')
        .eq('conversation_id', conversationId)
        .maybeSingle();

      const totalMatches = (current?.pinecone_matches_used || 0) + matchesUsed;
      const currentAvg = current?.avg_pinecone_confidence || 0;
      const newAvg = currentAvg > 0 
        ? ((currentAvg + avgConfidence) / 2) 
        : avgConfidence;

      await updateAnalytics({
        pinecone_matches_used: totalMatches,
        avg_pinecone_confidence: newAvg,
      });
    } catch (error) {
      console.error('Error tracking Pinecone usage:', error);
    }
  };

  const loadAnalytics = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversation_analytics')
        .select('*')
        .eq('conversation_id', conversationId)
        .maybeSingle();

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadAnalytics();
    }
  }, [conversationId]);

  return {
    analytics,
    loading,
    updateAnalytics,
    incrementMessageCount,
    markResolved,
    trackPineconeUsage,
  };
};
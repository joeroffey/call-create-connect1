import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PineconeQueryAnalytics {
  conversation_id: string;
  message_id: string;
  query_text: string;
  pinecone_matches: number;
  avg_confidence_score: number;
  top_match_confidence: number;
  user_found_helpful?: boolean;
}

export const usePineconeAnalytics = () => {
  const [loading, setLoading] = useState(false);

  const trackPineconeQuery = async (analytics: PineconeQueryAnalytics) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pinecone_query_analytics')
        .insert({
          conversation_id: analytics.conversation_id,
          message_id: analytics.message_id,
          query_text: analytics.query_text,
          pinecone_matches: analytics.pinecone_matches,
          avg_confidence_score: analytics.avg_confidence_score,
          top_match_confidence: analytics.top_match_confidence,
          user_found_helpful: analytics.user_found_helpful,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking Pinecone query:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQueryHelpfulness = async (messageId: string, helpful: boolean) => {
    try {
      const { error } = await supabase
        .from('pinecone_query_analytics')
        .update({ user_found_helpful: helpful })
        .eq('message_id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating query helpfulness:', error);
    }
  };

  const getQueryAnalytics = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('pinecone_query_analytics')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting query analytics:', error);
      return [];
    }
  };

  return {
    trackPineconeQuery,
    updateQueryHelpfulness,
    getQueryAnalytics,
    loading,
  };
};
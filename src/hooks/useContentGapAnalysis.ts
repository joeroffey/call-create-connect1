import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContentGap {
  question_theme: string;
  frequency: number;
  avg_pinecone_confidence: number;
  sample_questions: string[];
  flagged_for_review: boolean;
  review_status: 'pending' | 'reviewed' | 'content_added';
}

export const useContentGapAnalysis = () => {
  const [loading, setLoading] = useState(false);

  const analyzeContentGap = async (
    question: string, 
    pineconeConfidence: number, 
    theme?: string
  ) => {
    setLoading(true);
    try {
      // Extract theme from question if not provided
      const questionTheme = theme || extractTheme(question);
      
      // Check if this theme already exists
      const { data: existing, error: selectError } = await supabase
        .from('content_gap_analysis')
        .select('*')
        .eq('question_theme', questionTheme)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        // Update existing record
        const updatedSampleQuestions = [...existing.sample_questions];
        if (!updatedSampleQuestions.includes(question)) {
          updatedSampleQuestions.push(question);
          // Keep only the last 5 sample questions
          if (updatedSampleQuestions.length > 5) {
            updatedSampleQuestions.shift();
          }
        }

        const newFrequency = existing.frequency + 1;
        const newAvgConfidence = (existing.avg_pinecone_confidence + pineconeConfidence) / 2;
        
        // Flag for review if frequency is high and confidence is low
        const shouldFlag = newFrequency >= 3 && newAvgConfidence < 0.5;

        const { error: updateError } = await supabase
          .from('content_gap_analysis')
          .update({
            frequency: newFrequency,
            avg_pinecone_confidence: newAvgConfidence,
            sample_questions: updatedSampleQuestions,
            flagged_for_review: shouldFlag || existing.flagged_for_review,
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const shouldFlag = pineconeConfidence < 0.3; // Flag immediately if very low confidence

        const { error: insertError } = await supabase
          .from('content_gap_analysis')
          .insert({
            question_theme: questionTheme,
            frequency: 1,
            avg_pinecone_confidence: pineconeConfidence,
            sample_questions: [question],
            flagged_for_review: shouldFlag,
            review_status: 'pending',
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error analyzing content gap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentGaps = async (flaggedOnly: boolean = false) => {
    try {
      let query = supabase
        .from('content_gap_analysis')
        .select('*')
        .order('frequency', { ascending: false });

      if (flaggedOnly) {
        query = query.eq('flagged_for_review', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting content gaps:', error);
      return [];
    }
  };

  const updateReviewStatus = async (
    id: string, 
    status: 'pending' | 'reviewed' | 'content_added'
  ) => {
    try {
      const { error } = await supabase
        .from('content_gap_analysis')
        .update({ 
          review_status: status,
          flagged_for_review: status === 'content_added' ? false : true
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  return {
    analyzeContentGap,
    getContentGaps,
    updateReviewStatus,
    loading,
  };
};

// Helper function to extract theme from question
function extractTheme(question: string): string {
  const lowercaseQuestion = question.toLowerCase();
  
  // Building regulation themes
  if (lowercaseQuestion.includes('fire') || lowercaseQuestion.includes('escape')) return 'Fire Safety';
  if (lowercaseQuestion.includes('access') || lowercaseQuestion.includes('disability')) return 'Accessibility';
  if (lowercaseQuestion.includes('structure') || lowercaseQuestion.includes('load')) return 'Structural';
  if (lowercaseQuestion.includes('insulation') || lowercaseQuestion.includes('thermal')) return 'Thermal Performance';
  if (lowercaseQuestion.includes('ventilation') || lowercaseQuestion.includes('air')) return 'Ventilation';
  if (lowercaseQuestion.includes('drainage') || lowercaseQuestion.includes('sewage')) return 'Drainage';
  if (lowercaseQuestion.includes('sound') || lowercaseQuestion.includes('acoustic')) return 'Acoustics';
  if (lowercaseQuestion.includes('planning') || lowercaseQuestion.includes('permission')) return 'Planning';
  if (lowercaseQuestion.includes('extension') || lowercaseQuestion.includes('convert')) return 'Extensions/Conversions';
  if (lowercaseQuestion.includes('stair') || lowercaseQuestion.includes('step')) return 'Stairs';
  if (lowercaseQuestion.includes('window') || lowercaseQuestion.includes('door')) return 'Openings';
  if (lowercaseQuestion.includes('roof') || lowercaseQuestion.includes('ceiling')) return 'Roofing';
  if (lowercaseQuestion.includes('foundation') || lowercaseQuestion.includes('ground')) return 'Foundations';
  if (lowercaseQuestion.includes('wall') || lowercaseQuestion.includes('partition')) return 'Walls';
  if (lowercaseQuestion.includes('bathroom') || lowercaseQuestion.includes('toilet')) return 'Sanitation';
  if (lowercaseQuestion.includes('kitchen')) return 'Kitchen';
  if (lowercaseQuestion.includes('electric') || lowercaseQuestion.includes('wiring')) return 'Electrical';
  if (lowercaseQuestion.includes('gas') || lowercaseQuestion.includes('heating')) return 'Gas/Heating';
  if (lowercaseQuestion.includes('conservation') || lowercaseQuestion.includes('listed')) return 'Conservation';
  
  // Default theme
  return 'General Building Regulations';
}

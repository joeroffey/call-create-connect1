-- Create message feedback table
CREATE TABLE public.message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'helpful', 'not_helpful')),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation analytics table
CREATE TABLE public.conversation_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  project_id UUID,
  resolved BOOLEAN DEFAULT false,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  time_to_resolution INTEGER, -- in minutes
  total_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  follow_up_questions INTEGER DEFAULT 0,
  pinecone_matches_used INTEGER DEFAULT 0,
  avg_pinecone_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pinecone query analytics table
CREATE TABLE public.pinecone_query_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  message_id UUID NOT NULL,
  query_text TEXT NOT NULL,
  pinecone_matches INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(3,2),
  top_match_confidence DECIMAL(3,2),
  user_found_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content gap analysis table
CREATE TABLE public.content_gap_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_theme TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  avg_pinecone_confidence DECIMAL(3,2),
  sample_questions TEXT[],
  flagged_for_review BOOLEAN DEFAULT false,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'content_added')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinecone_query_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gap_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_feedback
CREATE POLICY "Users can create feedback for their own messages" 
ON public.message_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own message feedback" 
ON public.message_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own message feedback" 
ON public.message_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for conversation_analytics
CREATE POLICY "Users can view their own conversation analytics" 
ON public.conversation_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create conversation analytics" 
ON public.conversation_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update conversation analytics" 
ON public.conversation_analytics 
FOR UPDATE 
USING (true);

-- RLS policies for pinecone_query_analytics
CREATE POLICY "Users can view analytics for their conversations" 
ON public.pinecone_query_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM conversations 
  WHERE conversations.id = pinecone_query_analytics.conversation_id 
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "System can create query analytics" 
ON public.pinecone_query_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update query analytics" 
ON public.pinecone_query_analytics 
FOR UPDATE 
USING (true);

-- RLS policies for content_gap_analysis
CREATE POLICY "Admins can view content gap analysis" 
ON public.content_gap_analysis 
FOR SELECT 
USING (true); -- Will be restricted to admin users in application logic

CREATE POLICY "System can manage content gap analysis" 
ON public.content_gap_analysis 
FOR ALL 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.message_feedback 
ADD CONSTRAINT fk_message_feedback_conversation 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.message_feedback 
ADD CONSTRAINT fk_message_feedback_message 
FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

ALTER TABLE public.conversation_analytics 
ADD CONSTRAINT fk_conversation_analytics_conversation 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.conversation_analytics 
ADD CONSTRAINT fk_conversation_analytics_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.pinecone_query_analytics 
ADD CONSTRAINT fk_pinecone_query_analytics_conversation 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.pinecone_query_analytics 
ADD CONSTRAINT fk_pinecone_query_analytics_message 
FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

-- Create triggers for updated_at
CREATE TRIGGER update_message_feedback_updated_at
  BEFORE UPDATE ON public.message_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_analytics_updated_at
  BEFORE UPDATE ON public.conversation_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_gap_analysis_updated_at
  BEFORE UPDATE ON public.content_gap_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_message_feedback_message_id ON public.message_feedback(message_id);
CREATE INDEX idx_message_feedback_conversation_id ON public.message_feedback(conversation_id);
CREATE INDEX idx_conversation_analytics_user_id ON public.conversation_analytics(user_id);
CREATE INDEX idx_conversation_analytics_project_id ON public.conversation_analytics(project_id);
CREATE INDEX idx_pinecone_query_analytics_conversation_id ON public.pinecone_query_analytics(conversation_id);
CREATE INDEX idx_content_gap_analysis_review_status ON public.content_gap_analysis(review_status);
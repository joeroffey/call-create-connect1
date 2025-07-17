-- Create widget preferences table for customizable dashboards
CREATE TABLE public.user_widget_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  workspace_type TEXT NOT NULL CHECK (workspace_type IN ('personal', 'team')),
  widget_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique widget layout per user/workspace combination
  UNIQUE(user_id, team_id, workspace_type)
);

-- Enable RLS
ALTER TABLE public.user_widget_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own widget preferences"
ON public.user_widget_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own widget preferences"
ON public.user_widget_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget preferences"
ON public.user_widget_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget preferences"
ON public.user_widget_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_widget_preferences_user_workspace 
ON public.user_widget_preferences(user_id, workspace_type, team_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_widget_preferences_updated_at
BEFORE UPDATE ON public.user_widget_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
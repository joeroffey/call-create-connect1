-- Create notifications table for team project activities
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL,
  project_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'document_uploaded', 'task_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_id UUID,
  target_type TEXT CHECK (target_type IN ('task', 'document')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can create notifications (will be called from application code)
CREATE POLICY "Allow system to create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Function to create task assignment notifications
CREATE OR REPLACE FUNCTION public.create_task_assignment_notification(
  p_task_id UUID,
  p_assigned_to UUID,
  p_assigned_by UUID,
  p_project_id UUID,
  p_team_id UUID,
  p_task_title TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_name TEXT;
  assigner_name TEXT;
BEGIN
  -- Get project name
  SELECT name INTO project_name FROM public.projects WHERE id = p_project_id;
  
  -- Get assigner name
  SELECT full_name INTO assigner_name FROM public.profiles WHERE user_id = p_assigned_by;
  
  -- Only create notification if assigned to someone else
  IF p_assigned_to != p_assigned_by THEN
    INSERT INTO public.notifications (
      user_id,
      team_id,
      project_id,
      type,
      title,
      message,
      target_id,
      target_type,
      metadata
    ) VALUES (
      p_assigned_to,
      p_team_id,
      p_project_id,
      'task_assigned',
      'New Task Assignment',
      COALESCE(assigner_name, 'Someone') || ' assigned you a task: "' || p_task_title || '" in project "' || COALESCE(project_name, 'Unknown Project') || '"',
      p_task_id,
      'task',
      jsonb_build_object(
        'task_title', p_task_title,
        'project_name', project_name,
        'assigned_by', p_assigned_by,
        'assigner_name', assigner_name
      )
    );
  END IF;
  
  RETURN true;
END;
$$;

-- Function to create document upload notifications
CREATE OR REPLACE FUNCTION public.create_document_upload_notification(
  p_document_id UUID,
  p_uploader_id UUID,
  p_project_id UUID,
  p_team_id UUID,
  p_file_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_name TEXT;
  uploader_name TEXT;
  team_member RECORD;
BEGIN
  -- Get project name
  SELECT name INTO project_name FROM public.projects WHERE id = p_project_id;
  
  -- Get uploader name
  SELECT full_name INTO uploader_name FROM public.profiles WHERE user_id = p_uploader_id;
  
  -- Create notifications for all team members except the uploader
  FOR team_member IN 
    SELECT user_id FROM public.team_members 
    WHERE team_id = p_team_id AND user_id != p_uploader_id
  LOOP
    INSERT INTO public.notifications (
      user_id,
      team_id,
      project_id,
      type,
      title,
      message,
      target_id,
      target_type,
      metadata
    ) VALUES (
      team_member.user_id,
      p_team_id,
      p_project_id,
      'document_uploaded',
      'New Document Uploaded',
      COALESCE(uploader_name, 'Someone') || ' uploaded a document "' || p_file_name || '" to project "' || COALESCE(project_name, 'Unknown Project') || '"',
      p_document_id,
      'document',
      jsonb_build_object(
        'file_name', p_file_name,
        'project_name', project_name,
        'uploaded_by', p_uploader_id,
        'uploader_name', uploader_name
      )
    );
  END LOOP;
  
  RETURN true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_team_id ON public.notifications(team_id);
CREATE INDEX idx_notifications_project_id ON public.notifications(project_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
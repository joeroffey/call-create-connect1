-- Create function for comment notifications
CREATE OR REPLACE FUNCTION public.create_comment_notification(
  p_comment_id uuid,
  p_author_id uuid,
  p_team_id uuid,
  p_target_id uuid,
  p_target_type text,
  p_content text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  author_name TEXT;
  team_member RECORD;
  target_name TEXT;
BEGIN
  -- Get author name
  SELECT full_name INTO author_name FROM public.profiles WHERE user_id = p_author_id;
  
  -- Get target name based on type
  IF p_target_type = 'project' THEN
    SELECT name INTO target_name FROM public.projects WHERE id = p_target_id;
  ELSIF p_target_type = 'task' THEN
    SELECT title INTO target_name FROM public.project_schedule_of_works WHERE id = p_target_id;
  ELSE
    target_name := 'discussion';
  END IF;
  
  -- Create notifications for all team members except the author
  FOR team_member IN 
    SELECT user_id FROM public.team_members 
    WHERE team_id = p_team_id AND user_id != p_author_id
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
      CASE WHEN p_target_type = 'project' THEN p_target_id ELSE NULL END,
      'comment_created',
      'New Comment',
      COALESCE(author_name, 'Someone') || ' commented on ' || COALESCE(target_name, 'a discussion') || ': "' || 
      CASE 
        WHEN length(p_content) > 100 THEN substring(p_content from 1 for 100) || '...'
        ELSE p_content
      END || '"',
      p_comment_id,
      'comment',
      jsonb_build_object(
        'author_id', p_author_id,
        'author_name', author_name,
        'target_id', p_target_id,
        'target_type', p_target_type,
        'content_preview', substring(p_content from 1 for 100)
      )
    );
  END LOOP;
  
  RETURN true;
END;
$$;

-- Create function for project status change notifications
CREATE OR REPLACE FUNCTION public.create_project_status_notification(
  p_project_id uuid,
  p_changed_by uuid,
  p_team_id uuid,
  p_old_status text,
  p_new_status text,
  p_project_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  changer_name TEXT;
  team_member RECORD;
BEGIN
  -- Get changer name
  SELECT full_name INTO changer_name FROM public.profiles WHERE user_id = p_changed_by;
  
  -- Create notifications for team members with project access (excluding the person who made the change)
  FOR team_member IN 
    SELECT DISTINCT tm.user_id 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id != p_changed_by
    AND public.user_has_project_permission(tm.user_id, p_project_id, 'view')
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
      'project_status_changed',
      'Project Status Updated',
      COALESCE(changer_name, 'Someone') || ' changed the status of "' || p_project_name || '" from ' || 
      COALESCE(p_old_status, 'unknown') || ' to ' || p_new_status,
      p_project_id,
      'project',
      jsonb_build_object(
        'changed_by', p_changed_by,
        'changer_name', changer_name,
        'old_status', p_old_status,
        'new_status', p_new_status,
        'project_name', p_project_name
      )
    );
  END LOOP;
  
  RETURN true;
END;
$$;

-- Create function for project plan phase status change notifications
CREATE OR REPLACE FUNCTION public.create_phase_status_notification(
  p_phase_id uuid,
  p_project_id uuid,
  p_changed_by uuid,
  p_team_id uuid,
  p_old_status text,
  p_new_status text,
  p_phase_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  changer_name TEXT;
  project_name TEXT;
  team_member RECORD;
BEGIN
  -- Get changer name and project name
  SELECT full_name INTO changer_name FROM public.profiles WHERE user_id = p_changed_by;
  SELECT name INTO project_name FROM public.projects WHERE id = p_project_id;
  
  -- Create notifications for team members with project access (excluding the person who made the change)
  FOR team_member IN 
    SELECT DISTINCT tm.user_id 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id != p_changed_by
    AND public.user_has_project_permission(tm.user_id, p_project_id, 'view')
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
      'project_plan_status_changed',
      'Project Phase Updated',
      COALESCE(changer_name, 'Someone') || ' changed the status of phase "' || p_phase_name || '" in project "' || 
      COALESCE(project_name, 'Unknown Project') || '" from ' || COALESCE(p_old_status, 'unknown') || ' to ' || p_new_status,
      p_phase_id,
      'phase',
      jsonb_build_object(
        'changed_by', p_changed_by,
        'changer_name', changer_name,
        'old_status', p_old_status,
        'new_status', p_new_status,
        'phase_name', p_phase_name,
        'project_name', project_name,
        'project_id', p_project_id
      )
    );
  END LOOP;
  
  RETURN true;
END;
$$;

-- Create function for task completion notifications
CREATE OR REPLACE FUNCTION public.create_task_completion_notification(
  p_task_id uuid,
  p_completed_by uuid,
  p_project_id uuid,
  p_team_id uuid,
  p_task_title text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completer_name TEXT;
  project_name TEXT;
  team_member RECORD;
BEGIN
  -- Get completer name and project name
  SELECT full_name INTO completer_name FROM public.profiles WHERE user_id = p_completed_by;
  SELECT name INTO project_name FROM public.projects WHERE id = p_project_id;
  
  -- Create notifications for team members with project access (excluding the person who completed it)
  FOR team_member IN 
    SELECT DISTINCT tm.user_id 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id != p_completed_by
    AND public.user_has_project_permission(tm.user_id, p_project_id, 'view')
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
      'task_completed',
      'Task Completed',
      COALESCE(completer_name, 'Someone') || ' completed the task "' || p_task_title || '" in project "' || 
      COALESCE(project_name, 'Unknown Project') || '"',
      p_task_id,
      'task',
      jsonb_build_object(
        'completed_by', p_completed_by,
        'completer_name', completer_name,
        'task_title', p_task_title,
        'project_name', project_name,
        'project_id', p_project_id
      )
    );
  END LOOP;
  
  RETURN true;
END;
$$;

-- Update the document upload notification function to respect permissions
CREATE OR REPLACE FUNCTION public.create_document_upload_notification(p_document_id uuid, p_uploader_id uuid, p_project_id uuid, p_team_id uuid, p_file_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  project_name TEXT;
  uploader_name TEXT;
  team_member RECORD;
  doc_folder_id UUID;
BEGIN
  -- Get project name and uploader name
  SELECT name INTO project_name FROM public.projects WHERE id = p_project_id;
  SELECT full_name INTO uploader_name FROM public.profiles WHERE user_id = p_uploader_id;
  
  -- Get folder_id for the document if it's a completion document
  SELECT folder_id INTO doc_folder_id FROM public.project_completion_documents WHERE id = p_document_id;
  
  -- Create notifications for team members with access (excluding the uploader)
  FOR team_member IN 
    SELECT DISTINCT tm.user_id 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id != p_uploader_id
    AND (
      -- Check project permission
      public.user_has_project_permission(tm.user_id, p_project_id, 'view')
      AND (
        -- If document has a folder, check folder permission, otherwise just project permission is enough
        doc_folder_id IS NULL 
        OR public.user_has_folder_permission(tm.user_id, doc_folder_id, 'view')
      )
    )
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
        'uploader_name', uploader_name,
        'folder_id', doc_folder_id
      )
    );
  END LOOP;
  
  RETURN true;
END;
$$;
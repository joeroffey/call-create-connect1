-- Fix RLS policies to allow team members to access shared project schedules
DROP POLICY IF EXISTS "Users can view schedule of works from their own projects" ON public.project_schedule_of_works;
DROP POLICY IF EXISTS "Users can create schedule of works for their own projects" ON public.project_schedule_of_works;
DROP POLICY IF EXISTS "Users can update schedule of works from their own projects" ON public.project_schedule_of_works;
DROP POLICY IF EXISTS "Users can delete schedule of works from their own projects" ON public.project_schedule_of_works;

-- Create new RLS policies for project_schedule_of_works that allow team access
CREATE POLICY "Users can view schedule of works from accessible projects" 
ON public.project_schedule_of_works 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_schedule_of_works.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

CREATE POLICY "Users can create schedule of works for accessible projects" 
ON public.project_schedule_of_works 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_schedule_of_works.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

CREATE POLICY "Users can update schedule of works from accessible projects" 
ON public.project_schedule_of_works 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_schedule_of_works.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

CREATE POLICY "Users can delete schedule of works from accessible projects" 
ON public.project_schedule_of_works 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_schedule_of_works.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

-- Fix RLS policies for project_documents to allow team access
DROP POLICY IF EXISTS "Users can view documents from their own projects" ON public.project_documents;
DROP POLICY IF EXISTS "Users can create documents for their own projects" ON public.project_documents;
DROP POLICY IF EXISTS "Users can update documents from their own projects" ON public.project_documents;
DROP POLICY IF EXISTS "Users can delete documents from their own projects" ON public.project_documents;

CREATE POLICY "Users can view documents from accessible projects" 
ON public.project_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_documents.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

CREATE POLICY "Users can create documents for accessible projects" 
ON public.project_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_documents.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

CREATE POLICY "Users can update documents from accessible projects" 
ON public.project_documents 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_documents.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

CREATE POLICY "Users can delete documents from accessible projects" 
ON public.project_documents 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_documents.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  )
);

-- Create a function to safely count tasks per project
CREATE OR REPLACE FUNCTION public.get_project_task_count(project_id uuid)
RETURNS INTEGER
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.project_schedule_of_works
  WHERE project_id = $1;
$$;
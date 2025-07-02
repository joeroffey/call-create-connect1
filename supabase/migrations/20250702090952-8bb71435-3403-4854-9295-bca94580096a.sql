-- Create project status enum
CREATE TYPE public.project_status AS ENUM ('setup', 'in_progress', 'completed', 'on_hold');

-- Update projects table to use the enum and add team project fields
ALTER TABLE public.projects 
  ALTER COLUMN status TYPE project_status USING status::project_status,
  ALTER COLUMN status SET DEFAULT 'setup'::project_status;

-- Add assigned_to field to project_schedule_of_works for direct assignment
ALTER TABLE public.project_schedule_of_works 
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS assigned_by uuid,
  ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone DEFAULT now();

-- Drop existing policies first
DROP POLICY IF EXISTS "Team members can manage documents for team projects" ON public.project_documents;
DROP POLICY IF EXISTS "Team members can view comments" ON public.comments;
DROP POLICY IF EXISTS "Team members can create comments" ON public.comments;
DROP POLICY IF EXISTS "Comment authors can update their comments" ON public.comments;

-- Create new policy for team members to manage documents for team projects
CREATE POLICY "Team members can manage documents for team projects" 
ON public.project_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    LEFT JOIN public.team_members tm ON p.team_id = tm.team_id
    WHERE p.id = project_documents.project_id
    AND (p.user_id = auth.uid() OR tm.user_id = auth.uid())
  )
);

-- Create new policies for comments
CREATE POLICY "Users can view project and team comments" 
ON public.comments
FOR SELECT
TO authenticated
USING (
  -- Can see comments on projects they own or team projects they're part of
  (target_type = 'project' AND EXISTS (
    SELECT 1 FROM public.projects p
    LEFT JOIN public.team_members tm ON p.team_id = tm.team_id
    WHERE p.id::text = target_id
    AND (p.user_id = auth.uid() OR tm.user_id = auth.uid())
  )) OR
  -- Can see comments on teams they're part of
  (target_type = 'team' AND team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create comments on accessible projects" 
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id AND
  (
    -- Can comment on projects they own or team projects they're part of
    (target_type = 'project' AND EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE p.id::text = target_id
      AND (p.user_id = auth.uid() OR tm.user_id = auth.uid())
    )) OR
    -- Can comment on teams they're part of
    (target_type = 'team' AND team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id) WHERE team_id IS NOT NULL;
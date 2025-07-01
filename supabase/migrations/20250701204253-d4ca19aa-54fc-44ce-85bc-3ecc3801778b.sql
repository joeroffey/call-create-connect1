-- Fix infinite recursion in RLS policies by creating security definer functions

-- Create a security definer function to check if user can access project
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_user_id uuid, project_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() = project_user_id OR 
    (project_team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = project_team_id AND user_id = auth.uid()
    )) OR
    (EXISTS (
      SELECT 1 FROM public.team_projects tp
      JOIN public.team_members tm ON tp.team_id = tm.team_id
      WHERE tp.project_id IN (
        SELECT id FROM public.projects 
        WHERE user_id = project_user_id OR team_id = project_team_id
      ) AND tm.user_id = auth.uid()
    ))
$$;

-- Drop and recreate the projects SELECT policy with the security definer function
DROP POLICY IF EXISTS "Users can view their own projects or team projects" ON public.projects;

CREATE POLICY "Users can view their own projects or team projects" 
ON public.projects 
FOR SELECT 
USING (public.user_can_access_project(user_id, team_id));
-- CRITICAL SECURITY FIX: Restrict project access to prevent unauthorized access

-- Drop and recreate the user_can_access_project function with proper security
DROP FUNCTION IF EXISTS public.user_can_access_project(uuid, uuid);

CREATE OR REPLACE FUNCTION public.user_can_access_project(project_user_id uuid, project_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    -- Users can always access their own projects (personal projects)
    auth.uid() = project_user_id 
    OR 
    -- Users can access team projects ONLY if:
    -- 1. The project has a team_id (indicating it's a team project)
    -- 2. They are members of that specific team
    (project_team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = project_team_id AND user_id = auth.uid()
    ))
$$;

-- Refresh the existing policies to use the updated function
-- (The policies already reference this function, so they will automatically use the new version)
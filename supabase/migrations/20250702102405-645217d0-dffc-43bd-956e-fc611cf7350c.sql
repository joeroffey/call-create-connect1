-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;

-- Create a new policy that allows team members to update team projects
CREATE POLICY "Users can update accessible projects" 
ON public.projects 
FOR UPDATE 
USING (user_can_access_project(user_id, team_id));
-- Fix RLS policies for teams to allow team members to view teams they belong to
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;

-- Create a comprehensive policy that allows both owners and members to view teams
CREATE POLICY "Users can view teams they belong to" 
ON public.teams 
FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  is_user_team_member(auth.uid(), id)
);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_team_id_user_id ON public.projects(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);

-- Ensure conversations can be linked to team projects properly
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON public.conversations(project_id) WHERE project_id IS NOT NULL;
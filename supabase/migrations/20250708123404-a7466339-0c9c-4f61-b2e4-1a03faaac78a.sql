-- Fix conversations RLS policies to support team collaboration

-- Drop the old SELECT policy that only allows users to see their own conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Create new SELECT policy that allows team project access
CREATE POLICY "Users can view conversations from accessible projects"
ON public.conversations
FOR SELECT
USING (
  -- Users can see their own conversations
  auth.uid() = user_id 
  OR 
  -- Users can see conversations for team projects they have access to
  (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = conversations.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  ))
);
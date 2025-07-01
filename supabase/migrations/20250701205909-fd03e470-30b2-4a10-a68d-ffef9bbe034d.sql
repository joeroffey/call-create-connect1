-- Fix the infinite recursion by using a much simpler policy approach
-- Drop the problematic policy and recreate with no circular references

DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;

-- Create a simple policy that only checks team ownership for now
-- We'll handle team member access through a different approach
CREATE POLICY "Users can view teams they own" 
ON public.teams 
FOR SELECT 
USING (auth.uid() = owner_id);

-- For team members to view teams, we'll handle this at the application level
-- by using the get_teams_for_user function which already handles this correctly
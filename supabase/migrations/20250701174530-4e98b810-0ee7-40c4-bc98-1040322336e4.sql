
-- First, drop ALL existing policies on team_members to start clean
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

-- Disable RLS temporarily to clear any cached policy state
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- 1. Team owners can do everything with their team members
CREATE POLICY "owners_manage_members" ON team_members
FOR ALL
TO authenticated
USING (
  team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  )
);

-- 2. Users can view members of teams they belong to (simple SELECT only)
CREATE POLICY "view_own_team_members" ON team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members tm2 
    WHERE tm2.team_id = team_members.team_id 
    AND tm2.user_id = auth.uid()
  )
);

-- 3. Users can insert themselves into teams (for accepting invitations)
CREATE POLICY "insert_self_as_member" ON team_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());


-- Create a security definer function to check team membership without recursion
CREATE OR REPLACE FUNCTION public.is_team_member(user_id_param uuid, team_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = user_id_param 
    AND team_id = team_id_param
  );
$$;

-- Drop all existing policies on team_members
DROP POLICY IF EXISTS "owners_manage_members" ON team_members;
DROP POLICY IF EXISTS "view_own_team_members" ON team_members;
DROP POLICY IF EXISTS "insert_self_as_member" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

-- Disable and re-enable RLS to clear cache
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create new non-recursive policies using the security definer function

-- 1. Team owners can manage all members
CREATE POLICY "owners_full_access" ON team_members
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

-- 2. Users can view team members (using security definer function)
CREATE POLICY "members_can_view" ON team_members
FOR SELECT
TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id)
);

-- 3. Users can insert themselves as members
CREATE POLICY "self_insert_only" ON team_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

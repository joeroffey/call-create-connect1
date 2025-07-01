
-- =================================================================
-- Full RLS Policy Fix for Teams and Team Members
-- =================================================================

-- Step 1: Define the Helper Function (if not already present)
-- This function is essential for safely checking membership without causing recursion.
CREATE OR REPLACE FUNCTION public.is_team_member(user_id_param uuid, team_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = user_id_param
    AND team_id = team_id_param
  );
$$;


-- =================================================================
-- Step 2: Policies for the 'teams' table
-- PROBLEM: The query fails if RLS prevents reading from the 'teams' table.
-- SOLUTION: Add policies to allow viewing and managing teams.
-- =================================================================

-- First, ensure RLS is enabled on the 'teams' table.
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Drop any old policies that might conflict.
DROP POLICY IF EXISTS "members_can_view_their_teams" ON public.teams;
DROP POLICY IF EXISTS "users_can_create_teams" ON public.teams;
DROP POLICY IF EXISTS "owners_can_update_their_teams" ON public.teams;
DROP POLICY IF EXISTS "owners_can_delete_their_teams" ON public.teams;

-- POLICY 2.1: Allow members to view the details of teams they belong to.
CREATE POLICY "members_can_view_their_teams" ON public.teams
FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid(), id));

-- POLICY 2.2: Allow any authenticated user to create a new team.
CREATE POLICY "users_can_create_teams" ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (true);

-- POLICY 2.3: Allow the team owner to update team details.
CREATE POLICY "owners_can_update_their_teams" ON public.teams
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- POLICY 2.4: Allow the team owner to delete their team.
CREATE POLICY "owners_can_delete_their_teams" ON public.teams
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());


-- =================================================================
-- Step 3: Policies for the 'team_members' table
-- PROBLEM: The original recursive policies.
-- SOLUTION: Split policies to handle viewing self vs. viewing others.
-- =================================================================

-- Forcefully clear any cached policies for this table.
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to ensure a clean slate.
DROP POLICY IF EXISTS "owners_full_access" ON public.team_members;
DROP POLICY IF EXISTS "members_can_view" ON public.team_members;
DROP POLICY IF EXISTS "self_insert_only" ON public.team_members;
DROP POLICY IF EXISTS "owners_manage_members" ON public.team_members;
DROP POLICY IF EXISTS "view_own_team_members" ON public.team_members;
DROP POLICY IF EXISTS "insert_self_as_member" ON public.team_members;
DROP POLICY IF EXISTS "members_view_shared_teams" ON public.team_members;
DROP POLICY IF EXISTS "members_view_own_record" ON public.team_members;
DROP POLICY IF EXISTS "members_insert_own_record" ON public.team_members;

-- POLICY 3.1: Team owners have full management access over their team's members.
CREATE POLICY "owners_manage_members" ON public.team_members
FOR ALL
TO authenticated
USING (team_id IN (SELECT t.id FROM public.teams t WHERE t.owner_id = auth.uid()))
WITH CHECK (team_id IN (SELECT t.id FROM public.teams t WHERE t.owner_id = auth.uid()));

-- POLICY 3.2: A user can see their own membership record.
-- This is a critical, non-recursive policy that fixes the main bug.
CREATE POLICY "members_view_own_record" ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- POLICY 3.3: Members can view other members of teams they belong to.
-- This uses the helper function to avoid recursion. It works alongside Policy 3.2.
CREATE POLICY "members_view_shared_teams" ON public.team_members
FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid(), team_id));

-- POLICY 3.4: Users can insert their own membership record.
CREATE POLICY "members_insert_own_record" ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

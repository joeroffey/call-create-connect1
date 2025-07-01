
-- This migration fixes a recursive loop in the RLS policies for the team_members table.

-- The is_team_member function is necessary and correct.
-- This policy fix assumes the function from migration '20250701174917-a6b1ca61-cc49-4257-9eec-8443a27e65bb.sql' already exists.
-- CREATE OR REPLACE FUNCTION public.is_team_member(user_id_param uuid, team_id_param uuid) ...

-- Step 1: Drop ALL existing policies on team_members to ensure a clean slate.
-- This includes policies from both previous migration files.
DROP POLICY IF EXISTS "owners_full_access" ON public.team_members;
DROP POLICY IF EXISTS "members_can_view" ON public.team_members;
DROP POLICY IF EXISTS "self_insert_only" ON public.team_members;
DROP POLICY IF EXISTS "owners_manage_members" ON public.team_members;
DROP POLICY IF EXISTS "view_own_team_members" ON public.team_members;
DROP POLICY IF EXISTS "insert_self_as_member" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage all team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "members_view_shared_teams" ON public.team_members;
DROP POLICY IF EXISTS "members_view_own_record" ON public.team_members;
DROP POLICY IF EXISTS "members_insert_own_record" ON public.team_members;


-- Step 2: Re-create policies with a corrected, non-recursive logic.

-- POLICY 1: Team owners have full management access over their teams' members.
CREATE POLICY "owners_manage_members" ON public.team_members
FOR ALL
TO authenticated
USING (team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()))
WITH CHECK (team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()));

-- POLICY 2: A user can see their own membership record.
-- This is the critical fix. It's non-recursive and allows the useTeams hook
-- to fetch the list of teams a user belongs to.
CREATE POLICY "members_view_own_record" ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- POLICY 3: Members can view other members of teams they belong to.
-- This uses the security definer function to safely check for team membership without recursion.
-- It works with POLICY 2 because SELECT policies are combined with OR.
CREATE POLICY "members_view_shared_teams" ON public.team_members
FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid(), team_id));

-- POLICY 4: Users can insert their own membership record.
-- Required for creating teams (the owner is added) and accepting invites.
CREATE POLICY "members_insert_own_record" ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix infinite recursion in teams and team_members RLS policies

-- Create security definer function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_user_team_member(check_user_id uuid, check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = check_user_id AND team_id = check_team_id
  );
$$;

-- Create security definer function to check if user is team owner/admin
CREATE OR REPLACE FUNCTION public.is_user_team_owner_or_admin(check_user_id uuid, check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = check_user_id 
    AND team_id = check_team_id 
    AND role IN ('owner', 'admin')
  );
$$;

-- Drop and recreate team policies with security definer functions
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
DROP POLICY IF EXISTS "members_can_view_their_teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners and admins can update teams" ON public.teams;
DROP POLICY IF EXISTS "owners_can_update_their_teams" ON public.teams;

-- Recreate team policies
CREATE POLICY "Users can view teams they belong to" 
ON public.teams 
FOR SELECT 
USING (public.is_user_team_member(auth.uid(), id));

CREATE POLICY "Team owners and admins can update teams" 
ON public.teams 
FOR UPDATE 
USING (public.is_user_team_owner_or_admin(auth.uid(), id));

-- Drop and recreate team_members policies
DROP POLICY IF EXISTS "members_view_shared_teams" ON public.team_members;

CREATE POLICY "members_view_shared_teams" 
ON public.team_members 
FOR SELECT 
USING (public.is_user_team_member(auth.uid(), team_id));
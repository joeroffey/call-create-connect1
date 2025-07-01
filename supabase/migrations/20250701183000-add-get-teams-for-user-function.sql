
-- This function gets all teams a user is a member of.
-- It uses a standard SQL JOIN, which is more reliable than the
-- Supabase client's '!inner' syntax.
CREATE OR REPLACE FUNCTION get_teams_for_user(p_user_id uuid)
RETURNS SETOF teams -- The function will return a table of 'teams' rows.
LANGUAGE sql
STABLE
AS $$
  SELECT teams.*
  FROM public.teams
  JOIN public.team_members ON teams.id = team_members.team_id
  WHERE team_members.user_id = p_user_id;
$$;

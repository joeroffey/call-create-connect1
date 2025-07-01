-- Remove the overly permissive team creation policy that might be causing conflicts
DROP POLICY IF EXISTS "users_can_create_teams" ON public.teams;
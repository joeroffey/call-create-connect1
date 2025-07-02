-- Update the get_teams_for_user function to include logo_url
CREATE OR REPLACE FUNCTION public.get_teams_for_user(p_user_id uuid)
 RETURNS TABLE(id uuid, name text, description text, owner_id uuid, created_at timestamp with time zone, logo_url text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    t.id,
    t.name,
    t.description,
    t.owner_id,
    t.created_at,
    t.logo_url
  FROM public.teams t
  JOIN public.team_members tm
    ON tm.team_id = t.id
  WHERE tm.user_id = p_user_id;
$function$
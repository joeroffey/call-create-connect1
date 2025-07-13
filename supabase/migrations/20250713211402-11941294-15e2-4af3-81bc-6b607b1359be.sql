-- Update the user_has_project_permission function to allow team members edit access by default
CREATE OR REPLACE FUNCTION public.user_has_project_permission(p_user_id uuid, p_project_id uuid, p_required_level text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  -- Check if user has explicit project permission first
  SELECT EXISTS (
    SELECT 1 FROM public.project_permissions pp
    WHERE pp.user_id = p_user_id 
    AND pp.project_id = p_project_id
    AND (
      (p_required_level = 'view' AND pp.permission_level IN ('view', 'edit', 'admin')) OR
      (p_required_level = 'edit' AND pp.permission_level IN ('edit', 'admin')) OR
      (p_required_level = 'admin' AND pp.permission_level = 'admin')
    )
  )
  -- OR if user owns the project (for personal projects)
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id 
    AND p.user_id = p_user_id
    AND p.team_id IS NULL  -- Only for personal projects
  )
  -- OR if no explicit permissions are set for this project and user is a team member
  OR (
    NOT EXISTS (SELECT 1 FROM public.project_permissions WHERE project_id = p_project_id)
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = p_project_id 
      AND tm.user_id = p_user_id
      AND p.team_id IS NOT NULL  -- Only for team projects
      AND (
        -- Team members get view/edit by default, only admin requires explicit permission
        (p_required_level IN ('view', 'edit')) OR
        -- Only team owners/admins get admin permission by default
        (p_required_level = 'admin' AND tm.role IN ('owner', 'admin'))
      )
    )
  );
$function$
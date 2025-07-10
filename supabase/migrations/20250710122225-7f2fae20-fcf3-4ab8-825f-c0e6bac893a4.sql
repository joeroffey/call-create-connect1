
-- Update RLS policies to implement grant-specific access control instead of team-wide access

-- First, update project_completion_documents RLS policies
DROP POLICY IF EXISTS "Team members can create completion documents" ON public.project_completion_documents;
DROP POLICY IF EXISTS "Team members can view completion documents" ON public.project_completion_documents;
DROP POLICY IF EXISTS "Team members can update completion documents" ON public.project_completion_documents;
DROP POLICY IF EXISTS "Team members can delete completion documents" ON public.project_completion_documents;

-- New policies for project_completion_documents - require explicit permission or be uploader
CREATE POLICY "Users with project permission can view completion documents" 
ON public.project_completion_documents 
FOR SELECT 
USING (
  user_has_project_permission(auth.uid(), project_id, 'view')
);

CREATE POLICY "Users with project upload permission can create completion documents" 
ON public.project_completion_documents 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by 
  AND user_has_project_permission(auth.uid(), project_id, 'edit')
);

CREATE POLICY "Users with project edit permission can update completion documents" 
ON public.project_completion_documents 
FOR UPDATE 
USING (
  user_has_project_permission(auth.uid(), project_id, 'edit')
);

CREATE POLICY "Users with project admin permission can delete completion documents" 
ON public.project_completion_documents 
FOR DELETE 
USING (
  user_has_project_permission(auth.uid(), project_id, 'admin')
);

-- Update completion_document_folders RLS policies
DROP POLICY IF EXISTS "Team members can view folders" ON public.completion_document_folders;
DROP POLICY IF EXISTS "Team members can create folders" ON public.completion_document_folders;
DROP POLICY IF EXISTS "Team admins can manage folders" ON public.completion_document_folders;

-- New policies for completion_document_folders - require explicit permission
CREATE POLICY "Users with project permission can view folders" 
ON public.completion_document_folders 
FOR SELECT 
USING (
  user_has_project_permission(auth.uid(), project_id, 'view')
);

CREATE POLICY "Users with project edit permission can create folders" 
ON public.completion_document_folders 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND user_has_project_permission(auth.uid(), project_id, 'edit')
);

CREATE POLICY "Users with project admin permission can manage folders" 
ON public.completion_document_folders 
FOR UPDATE 
USING (
  user_has_project_permission(auth.uid(), project_id, 'admin')
);

CREATE POLICY "Users with project admin permission can delete folders" 
ON public.completion_document_folders 
FOR DELETE 
USING (
  user_has_project_permission(auth.uid(), project_id, 'admin')
);

-- Update the user_has_project_permission function to be more explicit
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
  -- OR if user is team owner/admin and no explicit permissions are set for this project
  OR (
    NOT EXISTS (SELECT 1 FROM public.project_permissions WHERE project_id = p_project_id)
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = p_project_id 
      AND tm.user_id = p_user_id
      AND tm.role IN ('owner', 'admin')
    )
  );
$function$;

-- Update the user_has_folder_permission function to be more explicit  
CREATE OR REPLACE FUNCTION public.user_has_folder_permission(p_user_id uuid, p_folder_id uuid, p_required_level text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  -- Check if user has explicit folder permission first
  SELECT EXISTS (
    SELECT 1 FROM public.folder_permissions fp
    WHERE fp.user_id = p_user_id 
    AND fp.folder_id = p_folder_id
    AND (
      (p_required_level = 'view' AND fp.permission_level IN ('view', 'upload', 'admin')) OR
      (p_required_level = 'upload' AND fp.permission_level IN ('upload', 'admin')) OR
      (p_required_level = 'admin' AND fp.permission_level = 'admin')
    )
  )
  -- OR if no explicit folder permissions exist, fall back to project permissions
  OR (
    NOT EXISTS (SELECT 1 FROM public.folder_permissions WHERE folder_id = p_folder_id)
    AND EXISTS (
      SELECT 1 FROM public.completion_document_folders f
      WHERE f.id = p_folder_id
      AND public.user_has_project_permission(p_user_id, f.project_id, 
        CASE 
          WHEN p_required_level = 'view' THEN 'view'
          WHEN p_required_level = 'upload' THEN 'edit'
          WHEN p_required_level = 'admin' THEN 'admin'
        END
      )
    )
  );
$function$;

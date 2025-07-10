-- Create project permissions table for granular access control
CREATE TABLE public.project_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create completion document folders table
CREATE TABLE public.completion_document_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.completion_document_folders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure folder names are unique within the same parent folder/project
  UNIQUE(project_id, parent_folder_id, name)
);

-- Create folder permissions table
CREATE TABLE public.folder_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES public.completion_document_folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'upload', 'admin')),
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(folder_id, user_id)
);

-- Add folder_id column to project_completion_documents
ALTER TABLE public.project_completion_documents 
ADD COLUMN folder_id UUID REFERENCES public.completion_document_folders(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.project_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_permissions ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at columns
CREATE TRIGGER update_project_permissions_updated_at
  BEFORE UPDATE ON public.project_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_completion_document_folders_updated_at
  BEFORE UPDATE ON public.completion_document_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_folder_permissions_updated_at
  BEFORE UPDATE ON public.folder_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for project_permissions
CREATE POLICY "Team members can view project permissions" 
ON public.project_permissions 
FOR SELECT 
USING (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Team admins can manage project permissions" 
ON public.project_permissions 
FOR ALL 
USING (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
))
WITH CHECK (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
));

-- RLS Policies for completion_document_folders
CREATE POLICY "Team members can view folders" 
ON public.completion_document_folders 
FOR SELECT 
USING (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Team members can create folders" 
ON public.completion_document_folders 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can manage folders" 
ON public.completion_document_folders 
FOR ALL 
USING (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
))
WITH CHECK (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
));

-- RLS Policies for folder_permissions
CREATE POLICY "Team members can view folder permissions" 
ON public.folder_permissions 
FOR SELECT 
USING (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Team admins can manage folder permissions" 
ON public.folder_permissions 
FOR ALL 
USING (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
))
WITH CHECK (team_id IN (
  SELECT team_id FROM public.team_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
));

-- Create helper functions for permission checking
CREATE OR REPLACE FUNCTION public.user_has_project_permission(
  p_user_id UUID,
  p_project_id UUID,
  p_required_level TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Check if user has explicit project permission
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
  -- OR if no explicit permissions exist, fall back to team membership
  OR (
    NOT EXISTS (SELECT 1 FROM public.project_permissions WHERE project_id = p_project_id)
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = p_project_id AND tm.user_id = p_user_id
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_folder_permission(
  p_user_id UUID,
  p_folder_id UUID,
  p_required_level TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Check if user has explicit folder permission
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
  -- OR if no explicit permissions exist, check project permissions
  OR (
    NOT EXISTS (SELECT 1 FROM public.folder_permissions WHERE folder_id = p_folder_id)
    AND EXISTS (
      SELECT 1 FROM public.completion_document_folders f
      WHERE f.id = p_folder_id
      AND public.user_has_project_permission(p_user_id, f.project_id, 'view')
    )
  );
$$;
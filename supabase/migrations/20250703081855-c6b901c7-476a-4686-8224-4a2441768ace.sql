-- Create storage bucket for completion documents
INSERT INTO storage.buckets (id, name, public) VALUES ('project-completion-documents', 'project-completion-documents', true);

-- Create storage policies for completion documents
CREATE POLICY "Team members can view completion documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-completion-documents' AND EXISTS (
  SELECT 1 FROM public.projects p
  JOIN public.team_members tm ON tm.team_id = p.team_id
  WHERE p.id::text = (storage.foldername(name))[1] 
  AND tm.user_id = auth.uid()
));

CREATE POLICY "Team members can upload completion documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-completion-documents' AND EXISTS (
  SELECT 1 FROM public.projects p
  JOIN public.team_members tm ON tm.team_id = p.team_id
  WHERE p.id::text = (storage.foldername(name))[1] 
  AND tm.user_id = auth.uid()
));

CREATE POLICY "Team members can update completion documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-completion-documents' AND EXISTS (
  SELECT 1 FROM public.projects p
  JOIN public.team_members tm ON tm.team_id = p.team_id
  WHERE p.id::text = (storage.foldername(name))[1] 
  AND tm.user_id = auth.uid()
));

CREATE POLICY "Team members can delete completion documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-completion-documents' AND EXISTS (
  SELECT 1 FROM public.projects p
  JOIN public.team_members tm ON tm.team_id = p.team_id
  WHERE p.id::text = (storage.foldername(name))[1] 
  AND tm.user_id = auth.uid()
));

-- Create project completion documents table
CREATE TABLE public.project_completion_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  description text,
  uploaded_by uuid NOT NULL,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on completion documents
ALTER TABLE public.project_completion_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for completion documents
CREATE POLICY "Team members can view completion documents" 
ON public.project_completion_documents 
FOR SELECT 
USING (team_id IN (
  SELECT team_members.team_id
  FROM team_members
  WHERE team_members.user_id = auth.uid()
));

CREATE POLICY "Team members can create completion documents" 
ON public.project_completion_documents 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by 
  AND team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.team_id = project_completion_documents.team_id
  )
);

CREATE POLICY "Team members can update completion documents" 
ON public.project_completion_documents 
FOR UPDATE 
USING (team_id IN (
  SELECT team_members.team_id
  FROM team_members
  WHERE team_members.user_id = auth.uid()
));

CREATE POLICY "Team members can delete completion documents" 
ON public.project_completion_documents 
FOR DELETE 
USING (team_id IN (
  SELECT team_members.team_id
  FROM team_members
  WHERE team_members.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_completion_documents_updated_at
BEFORE UPDATE ON public.project_completion_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
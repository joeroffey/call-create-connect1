-- Fix the storage policies for completion documents upload
-- Drop the existing incorrect policies
DROP POLICY IF EXISTS "Team members can upload completion documents" ON storage.objects;
DROP POLICY IF EXISTS "Team members can view completion documents" ON storage.objects;
DROP POLICY IF EXISTS "Team members can update completion documents" ON storage.objects;
DROP POLICY IF EXISTS "Team members can delete completion documents" ON storage.objects;

-- Create corrected policies for completion documents storage
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
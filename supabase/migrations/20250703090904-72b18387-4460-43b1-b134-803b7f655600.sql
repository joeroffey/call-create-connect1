-- Fix the storage policies for project-completion-documents bucket
-- Drop all existing policies for this bucket
DROP POLICY IF EXISTS "Team members can view completion documents" ON storage.objects;
DROP POLICY IF EXISTS "Team members can upload completion documents" ON storage.objects;
DROP POLICY IF EXISTS "Team members can update completion documents" ON storage.objects;
DROP POLICY IF EXISTS "Team members can delete completion documents" ON storage.objects;

-- Create simpler, working policies for project-completion-documents
CREATE POLICY "Allow authenticated users to view completion documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-completion-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to upload completion documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-completion-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update completion documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-completion-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete completion documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-completion-documents' AND auth.uid() IS NOT NULL);
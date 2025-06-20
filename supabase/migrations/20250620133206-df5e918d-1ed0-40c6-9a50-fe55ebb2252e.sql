
-- Create a storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', true);

-- Create policy to allow users to upload documents to their own projects
CREATE POLICY "Users can upload documents to their own projects" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to view documents from their own projects
CREATE POLICY "Users can view documents from their own projects" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update documents in their own projects
CREATE POLICY "Users can update documents in their own projects" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'project-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete documents from their own projects
CREATE POLICY "Users can delete documents from their own projects" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'project-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a table to track project documents with metadata
CREATE TABLE public.project_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on project_documents
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for project_documents
CREATE POLICY "Users can view documents from their own projects" 
  ON public.project_documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents for their own projects" 
  ON public.project_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update documents from their own projects" 
  ON public.project_documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete documents from their own projects" 
  ON public.project_documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp for project_documents
CREATE TRIGGER update_project_documents_updated_at 
    BEFORE UPDATE ON public.project_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add display_name column to project_completion_documents table
ALTER TABLE public.project_completion_documents 
ADD COLUMN display_name TEXT;

-- Set default display_name to file_name for existing records
UPDATE public.project_completion_documents 
SET display_name = file_name 
WHERE display_name IS NULL;
-- Allow team_id to be nullable for personal projects
ALTER TABLE public.project_completion_documents 
ALTER COLUMN team_id DROP NOT NULL;

-- Same for completion_document_folders
ALTER TABLE public.completion_document_folders 
ALTER COLUMN team_id DROP NOT NULL;

-- Same for project_plan_phases
ALTER TABLE public.project_plan_phases 
ALTER COLUMN team_id DROP NOT NULL;
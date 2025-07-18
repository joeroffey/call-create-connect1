-- Migrate data from project_documents to project_completion_documents
INSERT INTO public.project_completion_documents (
  project_id, 
  file_name, 
  file_path, 
  file_size, 
  file_type,
  uploaded_by, 
  team_id,
  category,
  description,
  created_at,
  updated_at
)
SELECT 
  pd.project_id,
  pd.file_name,
  pd.file_path,
  pd.file_size,
  pd.file_type,
  pd.user_id as uploaded_by,
  p.team_id, -- Get team_id from projects table
  'other' as category, -- Default category for migrated docs
  null as description, -- No description in old table
  pd.created_at,
  pd.updated_at
FROM public.project_documents pd
JOIN public.projects p ON p.id = pd.project_id
WHERE NOT EXISTS (
  -- Avoid duplicates if migration already run
  SELECT 1 FROM public.project_completion_documents pcd 
  WHERE pcd.project_id = pd.project_id 
  AND pcd.file_name = pd.file_name 
  AND pcd.file_path = pd.file_path
);
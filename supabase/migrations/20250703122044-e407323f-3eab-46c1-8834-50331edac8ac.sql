-- Drop the existing check constraint that's blocking comments
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_target_type_check;

-- Add a new check constraint that allows the completion_document target type
ALTER TABLE public.comments ADD CONSTRAINT comments_target_type_check 
CHECK (target_type IN ('project', 'task', 'document', 'completion_document'));
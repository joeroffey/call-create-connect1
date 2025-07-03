-- First, drop the existing constraint
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_target_type_check;

-- Add the new constraint that allows all the needed target types
ALTER TABLE public.comments ADD CONSTRAINT comments_target_type_check 
CHECK (target_type IN ('project', 'task', 'document', 'completion_document', 'team'));
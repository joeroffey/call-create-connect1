-- Fix the comments target_type constraint to allow 'team'
ALTER TABLE public.comments 
DROP CONSTRAINT comments_target_type_check;

-- Add new constraint that includes 'team'
ALTER TABLE public.comments 
ADD CONSTRAINT comments_target_type_check 
CHECK (target_type = ANY (ARRAY['project'::text, 'task'::text, 'document'::text, 'team'::text]));
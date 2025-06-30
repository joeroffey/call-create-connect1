
-- Add completed_at column to project_schedule_of_works table
ALTER TABLE public.project_schedule_of_works 
ADD COLUMN completed_at timestamp with time zone;

-- Update existing completed items to have a completion date (set to updated_at if available, otherwise now)
UPDATE public.project_schedule_of_works 
SET completed_at = updated_at 
WHERE completed = true AND completed_at IS NULL;

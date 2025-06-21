
-- Rename project_milestones table to project_schedule_of_works
ALTER TABLE public.project_milestones RENAME TO project_schedule_of_works;

-- Update the trigger name
DROP TRIGGER IF EXISTS update_project_milestones_updated_at ON public.project_schedule_of_works;
CREATE TRIGGER update_project_schedule_of_works_updated_at 
    BEFORE UPDATE ON public.project_schedule_of_works 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policy names
DROP POLICY IF EXISTS "Users can view milestones from their own projects" ON public.project_schedule_of_works;
DROP POLICY IF EXISTS "Users can create milestones for their own projects" ON public.project_schedule_of_works;
DROP POLICY IF EXISTS "Users can update milestones from their own projects" ON public.project_schedule_of_works;
DROP POLICY IF EXISTS "Users can delete milestones from their own projects" ON public.project_schedule_of_works;

CREATE POLICY "Users can view schedule of works from their own projects" 
  ON public.project_schedule_of_works 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create schedule of works for their own projects" 
  ON public.project_schedule_of_works 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update schedule of works from their own projects" 
  ON public.project_schedule_of_works 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete schedule of works from their own projects" 
  ON public.project_schedule_of_works 
  FOR DELETE 
  USING (auth.uid() = user_id);

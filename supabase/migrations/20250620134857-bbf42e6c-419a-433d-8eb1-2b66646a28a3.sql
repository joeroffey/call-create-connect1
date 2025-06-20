
-- Create a table for project milestones
CREATE TABLE public.project_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on project_milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for project_milestones
CREATE POLICY "Users can view milestones from their own projects" 
  ON public.project_milestones 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create milestones for their own projects" 
  ON public.project_milestones 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update milestones from their own projects" 
  ON public.project_milestones 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete milestones from their own projects" 
  ON public.project_milestones 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp for project_milestones
CREATE TRIGGER update_project_milestones_updated_at 
    BEFORE UPDATE ON public.project_milestones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

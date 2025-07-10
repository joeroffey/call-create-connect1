-- Create project_plan_phases table for gantt chart phases
CREATE TABLE public.project_plan_phases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  phase_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed')),
  color text NOT NULL DEFAULT '#3b82f6',
  order_index integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on project_plan_phases
ALTER TABLE public.project_plan_phases ENABLE ROW LEVEL SECURITY;

-- Create policies for project_plan_phases
CREATE POLICY "Users can view phases from accessible projects"
  ON public.project_plan_phases
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_plan_phases.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  ));

CREATE POLICY "Users can create phases for accessible projects"
  ON public.project_plan_phases
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_plan_phases.project_id 
      AND user_can_access_project(p.user_id, p.team_id)
    )
  );

CREATE POLICY "Users can update phases from accessible projects"
  ON public.project_plan_phases
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_plan_phases.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  ));

CREATE POLICY "Users can delete phases from accessible projects"
  ON public.project_plan_phases
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_plan_phases.project_id 
    AND user_can_access_project(p.user_id, p.team_id)
  ));

-- Add phase_id to existing project_schedule_of_works table
ALTER TABLE public.project_schedule_of_works 
ADD COLUMN phase_id uuid REFERENCES public.project_plan_phases(id) ON DELETE SET NULL,
ADD COLUMN start_date date,
ADD COLUMN end_date date;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_plan_phases_updated_at
  BEFORE UPDATE ON public.project_plan_phases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
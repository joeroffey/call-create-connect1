
-- Create teams table
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create team members table with roles
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team projects (shared projects)
CREATE TABLE public.team_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES auth.users(id),
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, project_id)
);

-- Create comments table for projects, tasks, and documents
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('project', 'task', 'document')),
  target_id uuid NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create task assignments table
CREATE TABLE public.task_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.project_schedule_of_works(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, assigned_to)
);

-- Create team invitations table
CREATE TABLE public.team_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create team activity log
CREATE TABLE public.team_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all team tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they belong to" 
  ON public.teams 
  FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners and admins can update teams" 
  ON public.teams 
  FOR UPDATE 
  USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners can delete teams" 
  ON public.teams 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Users can view team members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can manage members" 
  ON public.team_members 
  FOR ALL 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for team_projects
CREATE POLICY "Team members can view shared projects" 
  ON public.team_projects 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can share projects" 
  ON public.team_projects 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = shared_by AND
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for comments
CREATE POLICY "Team members can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = author_id AND
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Comment authors can update their comments" 
  ON public.comments 
  FOR UPDATE 
  USING (auth.uid() = author_id);

-- RLS Policies for task_assignments
CREATE POLICY "Team members can view task assignments" 
  ON public.task_assignments 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create task assignments" 
  ON public.task_assignments 
  FOR INSERT 
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for team_invitations
CREATE POLICY "Team owners and admins can manage invitations" 
  ON public.team_invitations 
  FOR ALL 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for team_activity
CREATE POLICY "Team members can view team activity" 
  ON public.team_activity 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create activity logs" 
  ON public.team_activity 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON public.teams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add team_id to existing projects table to support team ownership
ALTER TABLE public.projects ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- Update projects RLS to allow team access
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects or team projects" 
  ON public.projects 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) OR
    id IN (
      SELECT project_id FROM public.team_projects tp
      JOIN public.team_members tm ON tp.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

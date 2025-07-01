-- Re-enable RLS on teams table and fix policies properly
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- The issue was likely with the SELECT policy during INSERT operations
-- Let's create a simpler, more reliable policy structure
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;

CREATE POLICY "Users can view teams they belong to" 
ON public.teams 
FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id AND user_id = auth.uid()
  )
);
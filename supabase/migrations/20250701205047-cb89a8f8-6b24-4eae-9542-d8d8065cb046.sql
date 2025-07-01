-- Temporarily fix RLS issue by creating a simpler team creation policy

-- Drop the problematic SELECT policy that might be interfering
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;

-- Create a simpler SELECT policy that doesn't use functions during team creation
CREATE POLICY "Users can view teams they belong to" 
ON public.teams 
FOR SELECT 
USING (auth.uid() = owner_id OR id IN (
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
));
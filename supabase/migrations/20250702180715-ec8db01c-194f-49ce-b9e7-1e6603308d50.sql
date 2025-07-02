-- Add policy to allow team members to view each other's profiles
CREATE POLICY "Team members can view other team member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() 
    AND tm2.user_id = profiles.user_id
  )
);
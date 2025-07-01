-- Add missing INSERT policy for teams that was accidentally removed

CREATE POLICY "Users can create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);
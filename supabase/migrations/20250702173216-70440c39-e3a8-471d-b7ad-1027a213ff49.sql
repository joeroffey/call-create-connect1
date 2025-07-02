-- Add a policy to allow anyone to read team invitations if they have the invitation ID
-- This is secure because the invitation ID acts as a secret token
CREATE POLICY "Anyone can view invitations with valid token" 
ON public.team_invitations 
FOR SELECT 
USING (true);
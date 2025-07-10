-- Update the RLS policy to allow both owners and admins to manage team members
DROP POLICY IF EXISTS "owners_manage_members" ON team_members;

-- Create a new policy that allows both owners and admins to manage members
CREATE POLICY "owners_and_admins_manage_members" ON team_members
FOR ALL
TO authenticated
USING (is_user_team_owner_or_admin(auth.uid(), team_id))
WITH CHECK (is_user_team_owner_or_admin(auth.uid(), team_id));
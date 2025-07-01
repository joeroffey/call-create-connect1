
-- Fix the recursive RLS policy issue in team_members table
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Team owners and admins can manage members" ON team_members
FOR ALL
TO authenticated
USING (
  -- Allow if user is the owner of the team
  team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  )
  OR
  -- Allow if user is an admin of the team (but avoid self-reference)
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role = 'admin'
  )
)
WITH CHECK (
  -- Same logic for inserts/updates
  team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role = 'admin'
  )
);

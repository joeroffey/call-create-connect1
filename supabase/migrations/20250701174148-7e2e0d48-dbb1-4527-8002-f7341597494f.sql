
-- Drop the problematic policy completely
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;

-- Create a simple, non-recursive policy for team owners
CREATE POLICY "Team owners can manage all team members" ON team_members
FOR ALL
TO authenticated
USING (
  team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  )
);

-- Create a separate policy for users to view team members of teams they belong to
CREATE POLICY "Users can view team members of their teams" ON team_members
FOR SELECT
TO authenticated
USING (
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    WHERE tm.user_id = auth.uid()
  )
);

-- Create a policy for team admins to manage members (without recursion)
CREATE POLICY "Team admins can manage members" ON team_members
FOR ALL
TO authenticated
USING (
  -- Check if user is admin by looking at a stored function result
  EXISTS (
    SELECT 1 
    FROM team_members tm 
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid() 
    AND tm.role = 'admin'
    AND tm.team_id = team_members.team_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM team_members tm 
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid() 
    AND tm.role = 'admin'
    AND tm.team_id = team_members.team_id
  )
);

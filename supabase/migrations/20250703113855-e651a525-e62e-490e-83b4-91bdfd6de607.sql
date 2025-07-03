-- Add missing DELETE policy for comments
CREATE POLICY "Team members can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (
  auth.uid() = author_id 
  AND team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);
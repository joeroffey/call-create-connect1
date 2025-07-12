-- Update the messages RLS policy to allow team members to view messages 
-- from conversations in projects they have access to

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;

CREATE POLICY "Users can view messages from accessible conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      -- User owns the conversation
      c.user_id = auth.uid()
      OR 
      -- Conversation is in a project the user has access to
      (c.project_id IS NOT NULL AND EXISTS (
        SELECT 1 
        FROM projects p
        WHERE p.id = c.project_id 
        AND user_can_access_project(p.user_id, p.team_id)
      ))
    )
  )
);
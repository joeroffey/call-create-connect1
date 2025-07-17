-- Add unique constraint to user_widget_preferences table to fix upsert conflicts
-- First, remove any duplicate records by keeping only the first occurrence by created_at
DELETE FROM user_widget_preferences 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), workspace_type) id
  FROM user_widget_preferences 
  ORDER BY user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), workspace_type, created_at ASC
);

-- Add the unique constraint
ALTER TABLE user_widget_preferences 
ADD CONSTRAINT user_widget_preferences_user_id_team_id_workspace_type_key 
UNIQUE (user_id, team_id, workspace_type);
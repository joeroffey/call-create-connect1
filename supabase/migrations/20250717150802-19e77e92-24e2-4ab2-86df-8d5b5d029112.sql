-- Add unique constraint to user_widget_preferences table to fix upsert conflicts
-- First, remove any duplicate records to ensure the constraint can be added
DELETE FROM user_widget_preferences 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM user_widget_preferences 
  GROUP BY user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), workspace_type
);

-- Add the unique constraint
ALTER TABLE user_widget_preferences 
ADD CONSTRAINT user_widget_preferences_user_id_team_id_workspace_type_key 
UNIQUE (user_id, team_id, workspace_type);
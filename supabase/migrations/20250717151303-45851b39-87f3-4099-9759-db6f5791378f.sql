-- Clean up duplicate records from user_widget_preferences table
DELETE FROM user_widget_preferences 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), workspace_type) id
  FROM user_widget_preferences 
  ORDER BY user_id, COALESCE(team_id, '00000000-0000-0000-0000-000000000000'::uuid), workspace_type, created_at ASC
);
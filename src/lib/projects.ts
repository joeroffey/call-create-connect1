
import { supabase } from '@/integrations/supabase/client';

export async function fetchProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return projects;
}

export async function createProject({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert and select the new row in one go
  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert([{ user_id: user.id, name, description }])
    .select()
    .single();

  if (insertError) throw insertError;
  return project;
}

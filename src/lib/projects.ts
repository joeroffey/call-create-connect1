
import { supabase } from '@/integrations/supabase/client';

export async function fetchProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return projects;
}

export async function createProject({
  name,
  description,
  customer_name,
  customer_address,
  customer_phone,
}: {
  name: string;
  description?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert and select the new row in one go
  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert([{ 
      user_id: user.id, 
      name, 
      description,
      customer_name,
      customer_address,
      customer_phone
    }])
    .select()
    .single();

  if (insertError) throw insertError;
  return project;
}


import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch all teams for the current user via the get_teams_for_user RPC.
 */
export async function fetchTeams() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: teams, error } = await supabase
    .rpc('get_teams_for_user', { p_user_id: user.id });

  if (error) throw error;
  return teams;
}

/**
 * Create a new team and add the creator as its owner.
 */
export async function createTeam({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1) Insert the team and return the single row
  const { data: team, error: insertError } = await supabase
    .from('teams')
    .insert([{ name, description, owner_id: user.id }])
    .select()
    .single();

  if (insertError) throw insertError;

  // 2) Add the user as owner in team_members
  const { error: memberError } = await supabase
    .from('team_members')
    .insert([{ team_id: team.id, user_id: user.id, role: 'owner' }]);

  if (memberError) throw memberError;
  return team;
}

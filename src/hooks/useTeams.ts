
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by?: string;
  joined_at: string;
  profiles?: {
    full_name: string;
    user_id: string;
  };
}

export const useTeams = (userId?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeams = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('useTeams: Fetching teams for user:', userId);
      
      // First get teams where user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams!inner(*)
        `)
        .eq('user_id', userId);

      if (memberError) {
        console.error('useTeams: Error fetching member teams:', memberError);
        throw memberError;
      }

      // Extract teams from the member data
      const teamsData = memberTeams?.map(mt => mt.teams).filter(Boolean) || [];
      console.log('useTeams: Fetched teams:', teamsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('useTeams: Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description?: string) => {
    if (!userId) {
      console.error('useTeams: No userId provided for team creation');
      return null;
    }

    try {
      console.log('useTeams: Creating team:', { name, description, userId });
      
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{
          name,
          description,
          owner_id: userId
        }])
        .select()
        .single();

      if (teamError) {
        console.error('useTeams: Error creating team:', teamError);
        throw teamError;
      }

      console.log('useTeams: Team created:', teamData);

      // Add creator as owner to team_members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamData.id,
          user_id: userId,
          role: 'owner'
        }]);

      if (memberError) {
        console.error('useTeams: Error adding team member:', memberError);
        throw memberError;
      }

      console.log('useTeams: Team member added successfully');

      // Refresh teams list
      await fetchTeams();
      
      toast({
        title: "Success",
        description: "Team created successfully",
      });

      console.log('useTeams: Team creation completed successfully');
      return teamData;
    } catch (error) {
      console.error('useTeams: Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [userId]);

  return {
    teams,
    loading,
    createTeam,
    refetch: fetchTeams
  };
};

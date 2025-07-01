
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
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
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
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name,
          description,
          owner_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner to team_members
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: userId,
          role: 'owner'
        }]);

      // Update teams list immediately with the new team
      setTeams(prevTeams => [data, ...prevTeams]);
      
      toast({
        title: "Success",
        description: "Team created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating team:', error);
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

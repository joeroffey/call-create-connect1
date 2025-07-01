
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TeamMember } from './useTeams';

export const useTeamMembers = (teamId?: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!teamId) {
      console.log('useTeamMembers: No teamId provided');
      setMembers([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('useTeamMembers: Fetching members for team:', teamId);
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          invited_by,
          joined_at
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error('useTeamMembers: Error fetching members:', error);
        throw error;
      }

      // Fetch profiles separately
      const memberIds = data?.map(member => member.user_id) || [];
      let profilesData = [];
      
      if (memberIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', memberIds);
        
        if (profilesError) {
          console.error('useTeamMembers: Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Combine the data
      const typedMembers: TeamMember[] = (data || []).map(member => {
        const profile = profilesData.find(p => p.user_id === member.user_id);
        return {
          id: member.id,
          team_id: member.team_id,
          user_id: member.user_id,
          role: member.role as 'owner' | 'admin' | 'member' | 'viewer',
          invited_by: member.invited_by,
          joined_at: member.joined_at,
          profiles: profile ? {
            full_name: profile.full_name || '',
            user_id: profile.user_id
          } : undefined
        };
      });
      
      console.log('useTeamMembers: Fetched team members:', typedMembers);
      setMembers(typedMembers);
    } catch (error) {
      console.error('useTeamMembers: Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member' | 'viewer' = 'member') => {
    if (!teamId) return;

    try {
      const { error } = await supabase
        .from('team_invitations')
        .insert([{
          team_id: teamId,
          email,
          role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });
    } catch (error) {
      console.error('useTeamMembers: Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();
      toast({
        title: "Success",
        description: "Member role updated",
      });
    } catch (error) {
      console.error('useTeamMembers: Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();
      toast({
        title: "Success",
        description: "Member removed from team",
      });
    } catch (error) {
      console.error('useTeamMembers: Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  return {
    members,
    loading,
    inviteMember,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers
  };
};

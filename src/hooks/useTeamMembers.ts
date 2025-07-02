
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!user || !session) throw new Error('Not authenticated');

      // Get team details and user profile for the invitation
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        throw new Error('Team not found');
      }

      // Get inviter's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const inviterName = profile?.full_name || user.email?.split('@')[0] || 'Someone';

      console.log('Sending team invitation via edge function...');

      // Call the edge function to send invitation
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          teamId,
          email,
          role,
          teamName: team.name,
          inviterName
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send invitation');
      }

      console.log('Invitation sent successfully:', data);

      toast({
        title: "Success", 
        description: `Invitation sent to ${email}`,
      });

      // Refresh members list to show any updates
      await fetchMembers();
    } catch (error: any) {
      console.error('useTeamMembers: Error inviting member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite member",
        variant: "destructive",
      });
    }
  };

  const createTestInvitation = async (email: string, role: 'admin' | 'member' | 'viewer' = 'member') => {
    if (!teamId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!user || !session) throw new Error('Not authenticated');

      console.log('Creating test invitation link...');

      // Call the edge function to create test invitation
      const { data, error } = await supabase.functions.invoke('create-test-invitation', {
        body: {
          teamId,
          email,
          role
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create test invitation');
      }

      console.log('Test invitation created successfully:', data);

      toast({
        title: "Test Invitation Created",
        description: `Direct link generated for ${email}`,
      });

      return data.inviteLink;
    } catch (error: any) {
      console.error('Error creating test invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create test invitation",
        variant: "destructive",
      });
      return null;
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
    createTestInvitation,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers
  };
};

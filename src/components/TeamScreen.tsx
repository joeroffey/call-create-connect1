import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Settings, 
  Crown, 
  Shield, 
  Eye,
  MessageSquare,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeams } from '@/hooks/useTeams';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import CreateTeamModal from '@/components/team/CreateTeamModal';
import InviteMemberModal from '@/components/team/InviteMemberModal';

interface TeamScreenProps {
  user: any;
  subscriptionTier: string;
  onViewPlans: () => void;
}

const TeamScreen = ({ user, subscriptionTier, onViewPlans }: TeamScreenProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'members' | 'projects' | 'settings'>('overview');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const { teams, loading: teamsLoading, createTeam } = useTeams(user?.id);
  const { members, loading: membersLoading, inviteMember, updateMemberRole, removeMember } = useTeamMembers(selectedTeamId);

  // Select first team by default when teams are loaded
  React.useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  // Check if user has team access
  const hasTeamAccess = subscriptionTier === 'enterprise';

  const handleCreateTeam = async (name: string, description?: string) => {
    const newTeam = await createTeam(name, description);
    if (newTeam) {
      // Set the newly created team as selected
      setSelectedTeamId(newTeam.id);
    }
    return newTeam;
  };

  if (!hasTeamAccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-black">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Team Collaboration</h2>
          <p className="text-gray-400 mb-6">
            Team features are available for EezyBuild ProMax subscribers. Create teams, share projects, 
            assign tasks, and collaborate with your team members.
          </p>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">ProMax Team Features:</h3>
            <ul className="text-sm text-gray-300 space-y-1 text-left">
              <li>• Create and manage teams</li>
              <li>• Share projects with team members</li>
              <li>• Assign tasks and schedule items</li>
              <li>• Team comments and collaboration</li>
              <li>• Real-time activity updates</li>
              <li>• Role-based permissions</li>
            </ul>
          </div>
          <Button 
            onClick={onViewPlans}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            Upgrade to ProMax
          </Button>
        </div>
      </div>
    );
  }

  if (teamsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-emerald-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-white">{members.length}</p>
                <p className="text-sm text-gray-400">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-gray-400">Shared Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-gray-400">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-gray-400">Recent Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Team Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to show</p>
            <p className="text-sm">Team activity will appear here once you start collaborating</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Team Members</h3>
        <InviteMemberModal onInviteMember={inviteMember} />
      </div>
      
      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.id} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                    {member.profiles?.full_name?.substring(0, 2).toUpperCase() || 'UN'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.profiles?.full_name || 'Unknown User'}</p>
                    <p className="text-gray-400 text-sm">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {getRoleIcon(member.role)}
                    <span className="ml-1 capitalize">{member.role}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {members.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team members yet</p>
            <p className="text-sm">Invite members to start collaborating</p>
          </div>
        )}
      </div>
    </div>
  );

  // If no teams exist, show create team interface
  if (teams.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-black">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Create Your First Team</h2>
          <p className="text-gray-400 mb-6">
            Start collaborating with your team members by creating a team. 
            Share projects, assign tasks, and work together efficiently.
          </p>
          <CreateTeamModal onCreateTeam={handleCreateTeam} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedTeam?.name || 'Team'}</h1>
                <p className="text-gray-400">{members.length} members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CreateTeamModal 
                onCreateTeam={handleCreateTeam}
                trigger={
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Plus className="w-4 h-4 mr-2" />
                    New Team
                  </Button>
                }
              />
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Team Selector */}
          {teams.length > 1 && (
            <div className="mb-4">
              <select
                value={selectedTeamId || ''}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-lg"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'members', label: 'Members' },
              { id: 'projects', label: 'Projects' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'overview' && renderOverview()}
          {activeView === 'members' && renderMembers()}
          {activeView === 'projects' && (
            <div className="text-center py-12">
              <p className="text-gray-400">Team projects management coming soon...</p>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="text-center py-12">
              <p className="text-gray-400">Team settings coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamScreen;

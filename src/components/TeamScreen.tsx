
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  UserPlus, 
  Settings, 
  Crown, 
  Shield, 
  Eye,
  MessageSquare,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TeamScreenProps {
  user: any;
  subscriptionTier: string;
  onViewPlans: () => void;
}

const TeamScreen = ({ user, subscriptionTier, onViewPlans }: TeamScreenProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'members' | 'projects' | 'settings'>('overview');

  // Mock data - will be replaced with real data from Supabase
  const teamData = {
    name: "Building Crew Alpha",
    memberCount: 5,
    sharedProjects: 12,
    pendingInvites: 2
  };

  const teamMembers = [
    { id: 1, name: "John Smith", email: "john@buildcrew.com", role: "Owner", avatar: "JS", status: "online" },
    { id: 2, name: "Sarah Wilson", email: "sarah@buildcrew.com", role: "Admin", avatar: "SW", status: "online" },
    { id: 3, name: "Mike Johnson", email: "mike@buildcrew.com", role: "Member", avatar: "MJ", status: "away" },
    { id: 4, name: "Emma Davis", email: "emma@buildcrew.com", role: "Member", avatar: "ED", status: "offline" },
    { id: 5, name: "Tom Brown", email: "tom@buildcrew.com", role: "Viewer", avatar: "TB", status: "online" }
  ];

  const recentActivity = [
    { type: "comment", user: "Sarah Wilson", action: "commented on", target: "Kitchen Extension Project", time: "2 hours ago" },
    { type: "task", user: "Mike Johnson", action: "completed task", target: "Foundation Survey", time: "4 hours ago" },
    { type: "project", user: "Emma Davis", action: "shared project", target: "Bathroom Renovation", time: "1 day ago" },
    { type: "member", user: "John Smith", action: "invited", target: "Alex Parker", time: "2 days ago" }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'task': return <Calendar className="w-4 h-4" />;
      case 'project': return <FileText className="w-4 h-4" />;
      case 'member': return <UserPlus className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'Viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Check if user has team access
  const hasTeamAccess = subscriptionTier === 'enterprise'; // ProMax required for team features

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
            assign tasks, and collaborate with your building crew.
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-white">{teamData.memberCount}</p>
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
                <p className="text-2xl font-bold text-white">{teamData.sharedProjects}</p>
                <p className="text-sm text-gray-400">Shared Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">{teamData.pendingInvites}</p>
                <p className="text-sm text-gray-400">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-sm text-gray-400">Active Discussions</p>
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
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                    <span className="text-emerald-400">{activity.target}</span>
                  </p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Team Members</h3>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>
      
      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-gray-900`}></div>
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {getRoleIcon(member.role)}
                    <span className="ml-1">{member.role}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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
                <h1 className="text-2xl font-bold text-white">{teamData.name}</h1>
                <p className="text-gray-400">{teamData.memberCount} members • {teamData.sharedProjects} shared projects</p>
              </div>
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Settings className="w-4 h-4 mr-2" />
              Team Settings
            </Button>
          </div>

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
              <p className="text-gray-400">Team projects view coming soon...</p>
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

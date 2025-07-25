import React, { useRef, useState, useEffect } from 'react';
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
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BarChart3
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeams } from '@/hooks/useTeams';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import CreateTeamModal from '@/components/team/CreateTeamModal';
import InviteMemberModal from '@/components/team/InviteMemberModal';
import TeamLogoUpload from '@/components/team/TeamLogoUpload';
import TeamSettings from '@/components/team/TeamSettings';
import BasicTeamWork from '@/components/team/BasicTeamWork';
import TeamProjectsView from '@/components/team/TeamProjectsView';
import TeamTasksView from '@/components/team/TeamTasksView';
import TeamProjectPlanView from '@/components/team/TeamProjectPlanView';
import TeamCommentsView from '@/components/team/TeamCommentsView';
import TeamDiscussionsView from '@/components/team/TeamDiscussionsView';
import TeamDocumentsView from '@/components/team/TeamDocumentsView';
import { useTeamStats } from '@/hooks/useTeamStats';
import TeamActivityFeed from '@/components/team/TeamActivityFeed';
import { RoleSelect } from '@/components/team/RoleSelect';
import TeamProjectsDashboard from '@/components/team/TeamProjectsDashboard';
import QuickActions from '@/components/team/QuickActions';
import Dashboard from '@/components/widgets/Dashboard';

interface TeamScreenProps {
  user: any;
  subscriptionTier: string;
  onViewPlans: () => void;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
  selectedTeamId?: string | null; // Add optional prop for pre-selected team
  initialView?: string; // Add optional prop for initial view
}

const TeamScreen = ({ user, subscriptionTier, onViewPlans, onStartNewChat, selectedTeamId: propsSelectedTeamId, initialView }: TeamScreenProps) => {
  // Initialize activeView based on initialView prop - this ensures immediate state update
  const [activeView, setActiveView] = useState<'overview' | 'projects' | 'members' | 'schedule' | 'tasks' | 'discussions' | 'documents' | 'settings'>(() => {
    if (initialView && ['overview', 'projects', 'members', 'schedule', 'tasks', 'discussions', 'documents', 'settings'].includes(initialView)) {
      console.log('🎯 TeamScreen initializing with activeView:', initialView);
      return initialView as any;
    }
    return 'overview';
  });
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(propsSelectedTeamId || null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  const { teams, loading: teamsLoading, createTeam, refetch: refetchTeams } = useTeams(user?.id);
  const { members, loading: membersLoading, inviteMember, createTestInvitation, updateMemberRole, removeMember } = useTeamMembers(selectedTeamId);
  const teamStats = useTeamStats(selectedTeamId);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Use passed selectedTeamId prop or auto-select first team
  React.useEffect(() => {
    // If we have a props team ID and it's different from current, use it
    if (propsSelectedTeamId && propsSelectedTeamId !== selectedTeamId) {
      setSelectedTeamId(propsSelectedTeamId);
    }
    // Otherwise, auto-select first team if none selected
    else if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId, propsSelectedTeamId]);

  // PRIORITY 1: Handle initialView prop changes - this takes precedence over URL params
  React.useEffect(() => {
    if (initialView && ['overview', 'projects', 'members', 'schedule', 'tasks', 'discussions', 'documents', 'settings'].includes(initialView)) {
      console.log('🎯 TeamScreen initialView prop changed, setting activeView to:', initialView);
      setActiveView(initialView as any);
    }
  }, [initialView]);

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  // Update current logo URL when selected team changes
  React.useEffect(() => {
    if (selectedTeam) {
      setCurrentLogoUrl(selectedTeam.logo_url);
    }
  }, [selectedTeam]);

  // Handle URL parameters for navigation (e.g., from notifications)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const teamId = urlParams.get('team');
    
    // Handle URL parameters only if no initialView prop is provided
    if (!initialView) {
      // If there's a view parameter and we're on the team tab, set the active view
      if (view && ['overview', 'projects', 'members', 'schedule', 'tasks', 'discussions', 'documents', 'settings'].includes(view)) {
        setActiveView(view as any);
      }
    }
    
    // If there's a specific team ID in the URL and it exists in our teams, select it
    if (teamId && teams.length > 0) {
      const teamExists = teams.find(team => team.id === teamId);
      if (teamExists && selectedTeamId !== teamId) {
        setSelectedTeamId(teamId);
      }
    }
    
    // Clean up URL parameters after processing
    if (view || teamId) {
      setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }, 100);
    }
  }, [teams, selectedTeamId, initialView]); // Added initialView to dependencies

  // Check if user has team access
  const hasTeamAccess = subscriptionTier === 'enterprise';

  const handleCreateTeam = async (name: string, description?: string) => {
    try {
      const newTeam = await createTeam(name, description);
      if (newTeam) {
        setSelectedTeamId(newTeam.id);
        return newTeam;
      }
      return newTeam;
    } catch (error) {
      console.error('TeamScreen: Error in handleCreateTeam:', error);
      throw error;
    }
  };

  const handleLogoUpdate = (logoUrl: string | null) => {
    // Immediately update the local logo state for instant UI feedback
    setCurrentLogoUrl(logoUrl);
    // Also refetch to ensure data is in sync
    refetchTeams();
  };

  if (!hasTeamAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Team Collaboration</h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Unlock powerful team features with EezyBuild ProMax. Create teams, manage schedules,
            assign tasks, and collaborate seamlessly with your team members.
          </p>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 mb-8">
            <h3 className="text-white font-semibold mb-4 text-xl">ProMax Team Features:</h3>
            <div className="grid grid-cols-1 gap-3 text-left">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Create and manage multiple teams
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Upload custom team logos
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Advanced task scheduling & assignment
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Share projects with team members
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Real-time activity tracking
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Role-based permissions
              </div>
            </div>
          </div>
          <Button
            onClick={onViewPlans}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-xl text-lg font-semibold"
          >
            Upgrade to ProMax
          </Button>
        </div>
      </div>
    );
  }

  if (teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading teams...</p>
        </div>
      </div>
    );
  }

  // Helper function to determine if current user can remove a specific member
  const canRemoveMember = (member: any) => {
    const currentUserMember = members.find(m => m.user_id === user?.id);
    const isCurrentUserOwnerOrAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';
    const isTargetOwner = member.role === 'owner';
    const isCurrentUser = member.user_id === user?.id;
    
    return isCurrentUserOwnerOrAdmin && !isTargetOwner && !isCurrentUser;
  };

  // Helper function to determine if current user can edit a member's role
  const canEditRole = (member: any) => {
    const currentUserMember = members.find(m => m.user_id === user?.id);
    const currentUserRole = currentUserMember?.role;
    const isTargetOwner = member.role === 'owner';
    const isCurrentUser = member.user_id === user?.id;
    
    // Only owners and admins can edit roles
    // Cannot edit owner's role or own role
    return (currentUserRole === 'owner' || currentUserRole === 'admin') && !isTargetOwner && !isCurrentUser;
  };

  const currentUserMember = members.find(m => m.user_id === user?.id);
  const currentUserRole = currentUserMember?.role || null;

  // Handle member removal with confirmation
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await removeMember(memberId);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const renderOverview = () => (
    selectedTeamId ? (
      <Dashboard
        userId={user?.id || ''}
        teamId={selectedTeamId}
        workspaceType="team"
        onCreateProject={() => setActiveView('projects')}
        onViewProject={(projectId) => onStartNewChat(projectId)}
      />
    ) : null
  );

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Team Members</h3>
        <InviteMemberModal onInviteMember={inviteMember} onCreateTestInvitation={createTestInvitation} />
      </div>

      <div className="grid gap-4 w-full">
        {members.map((member) => (
          <Card key={member.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm sm:text-lg shadow-lg flex-shrink-0">
                    {member.profiles?.full_name?.substring(0, 2).toUpperCase() || 'UN'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm sm:text-lg truncate">{member.profiles?.full_name || 'Unknown User'}</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <RoleSelect
                    currentRole={member.role}
                    memberId={member.id}
                    memberName={member.profiles?.full_name || 'Unknown User'}
                    onRoleChange={updateMemberRole}
                    canEdit={canEditRole(member)}
                    isCurrentUser={member.user_id === user?.id}
                    isOwner={member.role === 'owner'}
                    currentUserRole={currentUserRole}
                  />
                  
                  {/* Remove member button - only show for owners/admins and not for owners/current user */}
                  {canRemoveMember(member) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-600/30 text-red-400 hover:bg-red-600/20 hover:border-red-600/50 px-2 py-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remove Team Member</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            Are you sure you want to remove{' '}
                            <span className="font-semibold text-white">
                              {member.profiles?.full_name || 'this member'}
                            </span>{' '}
                            from the team? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || 'Unknown User')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Remove Member
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {members.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No team members yet</h3>
            <p className="text-sm">Invite members to start collaborating</p>
          </div>
        )}
      </div>
    </div>
  );

  // If no teams exist, show create team interface
  if (teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Create Your First Team</h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Start collaborating with your team members by creating a team.
            Share projects, assign tasks, and work together efficiently.
          </p>
          <CreateTeamModal onCreateTeam={handleCreateTeam} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32 w-full">{/* Added pb-32 for mobile nav spacing */}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center space-x-6">
              <TeamLogoUpload
                teamId={selectedTeamId!}
                currentLogoUrl={currentLogoUrl}
                onLogoUpdate={handleLogoUpdate}
              />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{selectedTeam?.name || 'Team'}</h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {members.length} members
                  </div>
                  {selectedTeam?.description && (
                    <p className="text-gray-400">{selectedTeam.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className='relative'>
            {/* Scrollable Container with Fade Gradients */}
            <div className="relative overflow-hidden">
              {/* Left Fade Gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />
              
              {/* Right Fade Gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />
              
              <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide teampage-tabs px-4 py-2">
                <div className="flex justify-between items-center w-full min-w-max">
                  <div className="flex gap-2">
                    {[
                      { id: 'overview', label: 'Overview', icon: FileText },
                      { id: 'projects', label: 'Projects', icon: FileText },
                      { id: 'documents', label: 'Documents', icon: CheckCircle },
                      { id: 'tasks', label: 'Active Tasks', icon: Calendar },
                      { id: 'schedule', label: 'Project Plans', icon: BarChart3 },
                      { id: 'discussions', label: 'Discussions', icon: MessageSquare }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeView === tab.id
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                          }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {[
                      { id: 'members', label: 'Members', icon: Users },
                      { id: 'settings', label: 'Settings', icon: Settings }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeView === tab.id
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                          }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Swipe Indicator for Mobile */}
            <div className="md:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ChevronLeft className="w-3 h-3" />
                <span>Swipe</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'overview' && renderOverview()}
          {activeView === 'members' && renderMembers()}
          {activeView === 'projects' && (() => {
            if (!selectedTeamId || !selectedTeam) {
              return (
                <div className="text-center py-12 text-white">
                  <p>Loading team data...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Team ID: {selectedTeamId || 'missing'}, Team: {selectedTeam?.name || 'missing'}
                  </p>
                </div>
              );
            }

            return (
              <TeamProjectsView
                user={user}
                teamId={selectedTeamId}
                teamName={selectedTeam.name}
                onStartNewChat={onStartNewChat}
              />
            );
          })()}
          {activeView === 'tasks' && selectedTeamId && selectedTeam && (
            <TeamTasksView
              teamId={selectedTeamId}
              teamName={selectedTeam.name}
            />
          )}
          {activeView === 'schedule' && selectedTeamId && selectedTeam && (
            <TeamProjectPlanView
              teamId={selectedTeamId}
              teamName={selectedTeam.name}
            />
          )}
          {activeView === 'discussions' && selectedTeamId && (
            (() => {
              // Check if there's a specific project ID in the hash for team discussions
              const teamDiscussionsMatch = window.location.hash.match(/#team-discussions\/([^/]+)\/(.+)/);
              const projectId = teamDiscussionsMatch && teamDiscussionsMatch[1] === selectedTeamId ? teamDiscussionsMatch[2] : null;
              return <TeamDiscussionsView teamId={selectedTeamId} preSelectedProjectId={projectId} />;
            })()
          )}
          {activeView === 'documents' && selectedTeamId && (
            (() => {
              // Check if there's a specific project ID in the hash for team documents
              const teamDocumentsMatch = window.location.hash.match(/#team-documents\/([^/]+)\/(.+)/);
              const projectId = teamDocumentsMatch && teamDocumentsMatch[1] === selectedTeamId ? teamDocumentsMatch[2] : null;
              return <TeamDocumentsView teamId={selectedTeamId} preSelectedProjectId={projectId} />;
            })()
          )}
          {activeView === 'settings' && selectedTeam && (
            <TeamSettings
              team={selectedTeam}
              onTeamUpdate={refetchTeams}
              onCreateTeam={handleCreateTeam}
              onTeamDelete={() => {
                // Navigate back to overview or handle team deletion
                setSelectedTeamId(null);
                refetchTeams();
              }}
              isOwner={selectedTeam.owner_id === user?.id}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamScreen;

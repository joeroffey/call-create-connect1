import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, User, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import existing components
import ProjectsScreen from './ProjectsScreen';
import TeamScreen from './TeamScreen';
import { useTeams } from '@/hooks/useTeams';

interface WorkspaceScreenProps {
  user: any;
  subscriptionTier: string;
  onViewPlans: () => void;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
  pendingProjectModal?: {projectId: string, view: string} | null;
  onProjectModalHandled?: () => void;
}

type WorkspaceContext = 'personal' | 'team';

const WorkspaceScreen = ({ 
  user, 
  subscriptionTier, 
  onViewPlans, 
  onStartNewChat,
  pendingProjectModal,
  onProjectModalHandled
}: WorkspaceScreenProps) => {
  const [context, setContext] = useState<WorkspaceContext>('personal');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const { teams, loading: teamsLoading } = useTeams(user?.id);

  // Auto-select first team when teams load
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Handle pending project modal from notifications
  useEffect(() => {
    if (pendingProjectModal) {
      // If there's a pending project modal, we need to determine the context
      // For now, we'll check if it's a team project or personal project
      setContext('personal'); // Default to personal, the component will handle team projects
    }
  }, [pendingProjectModal]);

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  const handleContextChange = (newContext: WorkspaceContext, teamId?: string) => {
    setContext(newContext);
    if (newContext === 'team' && teamId) {
      setSelectedTeamId(teamId);
    }
  };

  const renderContextSelector = () => (
    <div className="flex items-center gap-4 p-6 border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Workspace:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 min-w-[200px] justify-between">
              <div className="flex items-center gap-2">
                {context === 'personal' ? (
                  <>
                    <User className="w-4 h-4" />
                    <span>Personal</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>{selectedTeam?.name || 'Select Team'}</span>
                  </>
                )}
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[200px]">
            <DropdownMenuItem 
              onClick={() => handleContextChange('personal')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Personal</span>
            </DropdownMenuItem>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleContextChange('team', team.id)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>{team.name}</span>
                {subscriptionTier !== 'enterprise' && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Pro Max
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {context === 'team' && subscriptionTier !== 'enterprise' && (
        <Badge variant="outline" className="text-amber-400 border-amber-400">
          Upgrade Required for Full Team Features
        </Badge>
      )}
    </div>
  );

  const renderContent = () => {
    if (context === 'personal') {
      return (
        <ProjectsScreen
          user={user}
          onStartNewChat={onStartNewChat}
          pendingProjectModal={pendingProjectModal}
          onProjectModalHandled={onProjectModalHandled}
        />
      );
    }

    if (context === 'team') {
      // Show upgrade prompt for non-ProMax users
      if (subscriptionTier !== 'enterprise') {
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-md text-center">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Users className="w-5 h-5" />
                  Team Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">
                  Team collaboration features are available with EezyBuild ProMax.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Team project management</div>
                  <div>• Member collaboration</div>
                  <div>• Task assignments</div>
                  <div>• Project planning</div>
                  <div>• Document sharing</div>
                </div>
                <Button 
                  onClick={onViewPlans}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                >
                  Upgrade to ProMax
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Show full team functionality for ProMax users
      return (
        <TeamScreen
          user={user}
          subscriptionTier={subscriptionTier}
          onViewPlans={onViewPlans}
          onStartNewChat={onStartNewChat}
        />
      );
    }

    return null;
  };

  if (teamsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {renderContextSelector()}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${context}-${selectedTeamId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkspaceScreen;
import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectDiscussionsTabProps {
  project: any;
  user: any;
}

const ProjectDiscussionsTab = ({ project, user }: ProjectDiscussionsTabProps) => {
  const handleNavigateToDiscussions = () => {
    if (project.team_id) {
      // Navigate to team discussions
      window.location.hash = `#team-discussions/${project.team_id}`;
      window.postMessage({ type: 'NAVIGATE_TO_WORKSPACE', hash: `team-discussions/${project.team_id}` }, '*');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Team Discussions</h3>
          <p className="text-gray-400 text-sm">Collaborate and discuss project details with your team</p>
        </div>
        {project.team_id && (
          <Button
            onClick={handleNavigateToDiscussions}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Discussions
          </Button>
        )}
      </div>

      {/* Content */}
      {project.team_id ? (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white mb-2">Team Collaboration Hub</h4>
              <p className="text-gray-400 text-sm mb-4">
                Join your team discussions to collaborate on project decisions, share updates, 
                and coordinate work. All discussions are organized by team for easy navigation.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Real-time Chat
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Team Members
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Project Updates
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <Button
              onClick={handleNavigateToDiscussions}
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Join Team Discussions
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Team Discussions Available for Team Projects</h3>
          <p className="text-sm text-gray-400">
            This is a personal project. Team discussions are available for projects shared with your team.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectDiscussionsTab;
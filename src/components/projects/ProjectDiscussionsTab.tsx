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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Team Discussions</h3>
          <p className="text-muted-foreground mt-1">Collaborate and discuss project details with your team</p>
        </div>
        {project.team_id && (
          <Button
            onClick={handleNavigateToDiscussions}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Open Discussions
          </Button>
        )}
      </div>

      {/* Content */}
      {project.team_id ? (
        <div className="bg-card/30 backdrop-blur border border-border/30 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-foreground mb-4">Team Collaboration Hub</h4>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Join your team discussions to collaborate on project decisions, share updates, 
                and coordinate work. All discussions are organized by team for easy navigation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium">Real-time Chat</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">Team Members</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium">Project Updates</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50">
            <Button
              onClick={handleNavigateToDiscussions}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Join Team Discussions
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-card/30 backdrop-blur border border-border/30 rounded-2xl">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">Team Discussions Available for Team Projects</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This is a personal project. Team discussions are available for projects shared with your team.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectDiscussionsTab;
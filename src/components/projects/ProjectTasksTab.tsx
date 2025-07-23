import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectTasksTabProps {
  project: any;
  user: any;
}

const ProjectTasksTab = ({ project, user }: ProjectTasksTabProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Active Tasks</h3>
          <p className="text-muted-foreground mt-1">Quick task management and assignments</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="text-center py-16 bg-card/30 backdrop-blur border border-border/30 rounded-2xl">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Advanced Task Management</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Enhanced task features are coming soon. For now, use the Schedule tab to manage your project tasks.
        </p>
        <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-4 max-w-lg mx-auto">
          <strong className="text-foreground">Features in development:</strong> Task dependencies, time tracking, subtasks, and team collaboration tools.
        </div>
      </div>
    </div>
  );
};

export default ProjectTasksTab;
import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectTasksTabProps {
  project: any;
  user: any;
}

const ProjectTasksTab = ({ project, user }: ProjectTasksTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Active Tasks</h3>
          <p className="text-gray-400 text-sm">Quick task management and assignments</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">Advanced Task Management</h3>
        <p className="text-sm text-gray-400 mb-6">
          Enhanced task features are coming soon. For now, use the Schedule tab to manage your project tasks.
        </p>
        <div className="text-xs text-gray-500">
          Features in development: Task dependencies, time tracking, subtasks, and team collaboration tools.
        </div>
      </div>
    </div>
  );
};

export default ProjectTasksTab;
import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectTasksTabProps {
  project: any;
  user: any;
}

const ProjectTasksTab = ({ project, user }: ProjectTasksTabProps) => {
  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Task Management</h3>
          <p className="text-muted-foreground mt-1">
            Organize and track project tasks and milestones
          </p>
        </div>
      </div>

      {/* Enhanced Coming Soon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-12 text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckSquare className="w-10 h-10 text-primary" />
        </div>
        
        <h3 className="text-2xl font-semibold text-foreground mb-4">
          Advanced Task Management
        </h3>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
          A comprehensive task management system is coming soon. For now, use the Schedule tab 
          to manage your project tasks and timelines.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <motion.div
            className="bg-muted/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Task Dependencies</h4>
            <p className="text-sm text-muted-foreground">
              Link tasks together to create logical project workflows
            </p>
          </motion.div>
          
          <motion.div
            className="bg-muted/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Time Tracking</h4>
            <p className="text-sm text-muted-foreground">
              Monitor time spent on tasks for better project estimation
            </p>
          </motion.div>
          
          <motion.div
            className="bg-muted/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Subtasks</h4>
            <p className="text-sm text-muted-foreground">
              Break down complex tasks into manageable subtasks
            </p>
          </motion.div>
        </div>

        {/* Temporary Solution */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 max-w-2xl mx-auto">
          <h4 className="font-semibold text-foreground mb-3">
            In the meantime, use the Schedule tab
          </h4>
          <p className="text-muted-foreground mb-4">
            The Schedule tab provides basic task management capabilities including 
            task creation, assignment, and completion tracking.
          </p>
          <Button
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground group"
            onClick={() => {
              // Switch to schedule tab
              const scheduleTab = document.querySelector('[value="schedule"]') as HTMLElement;
              scheduleTab?.click();
            }}
          >
            Go to Schedule
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectTasksTab;
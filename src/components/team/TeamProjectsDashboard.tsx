import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TeamProject {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  user_id: string;
  taskCount: number;
  completedTasks: number;
  memberCount: number;
  daysLeft?: number;
  lastActivity?: string;
}

interface TeamProjectsDashboardProps {
  teamId: string;
  onCreateProject?: () => void;
  onViewProject?: (projectId: string) => void;
}

const TeamProjectsDashboard = ({ teamId, onCreateProject, onViewProject }: TeamProjectsDashboardProps) => {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      fetchTeamProjects();
    }
  }, [teamId]);

  const fetchTeamProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch team projects with task counts
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          updated_at,
          customer_name,
          user_id,
          project_schedule_of_works(
            id,
            completed,
            due_date
          )
        `)
        .eq('team_id', teamId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get team member count for each project
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      const memberCount = membersData?.length || 0;

      // Process projects with additional data
      const processedProjects: TeamProject[] = projectsData?.map(project => {
        const tasks = project.project_schedule_of_works || [];
        const taskCount = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        
        // Calculate days left for nearest due date
        const upcomingTasks = tasks.filter(task => task.due_date && !task.completed);
        const nearestDueDate = upcomingTasks.length > 0 
          ? Math.min(...upcomingTasks.map(task => new Date(task.due_date).getTime()))
          : null;
        
        const daysLeft = nearestDueDate 
          ? Math.ceil((nearestDueDate - Date.now()) / (1000 * 60 * 60 * 24))
          : undefined;

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          created_at: project.created_at,
          updated_at: project.updated_at,
          customer_name: project.customer_name,
          user_id: project.user_id,
          taskCount,
          completedTasks,
          memberCount,
          daysLeft,
          lastActivity: project.updated_at
        };
      }) || [];

      setProjects(processedProjects);
    } catch (error) {
      console.error('Error fetching team projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'planning': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4" />;
      case 'planning': return <Target className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Action */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Team Projects</h3>
          <p className="text-gray-400 text-sm">{projects.length} active projects</p>
        </div>
        <Button
          onClick={onCreateProject}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all cursor-pointer group hover:shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      {project.name}
                    </CardTitle>
                    {project.customer_name && (
                      <p className="text-gray-400 text-sm mt-1">
                        Client: {project.customer_name}
                      </p>
                    )}
                  </div>
                  <Badge 
                    className={`${getStatusColor(project.status)} text-white text-xs`}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">
                      {project.completedTasks}/{project.taskCount} tasks
                    </span>
                  </div>
                  <Progress 
                    value={calculateProgress(project.completedTasks, project.taskCount)}
                    className="h-2"
                  />
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{project.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {project.daysLeft !== undefined ? (
                      <span className={project.daysLeft < 0 ? 'text-red-400' : project.daysLeft < 7 ? 'text-yellow-400' : ''}>
                        {project.daysLeft < 0 ? 'Overdue' : `${project.daysLeft} days left`}
                      </span>
                    ) : (
                      <span>No deadline</span>
                    )}
                  </div>
                </div>

                {/* Last Activity */}
                <div className="text-xs text-gray-500">
                  Last updated: {format(new Date(project.lastActivity || project.updated_at), 'MMM dd, yyyy')}
                </div>

                {/* Action Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewProject?.(project.id)}
                  className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 mt-3 group-hover:bg-emerald-500/20"
                >
                  View Project
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first team project to get started</p>
          <Button
            onClick={onCreateProject}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamProjectsDashboard;
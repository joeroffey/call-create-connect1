import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowRight, CheckSquare, Clock, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProjectPlanView } from './ProjectPlanView';

interface TeamProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

interface TeamTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  project_id: string;
  project_name: string;
  created_at: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
}

interface TeamProjectPlanViewProps {
  teamId: string;
  teamName: string;
}

const TeamProjectPlanView = ({ teamId, teamName }: TeamProjectPlanViewProps) => {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<TeamProject | null>(null);
  const { toast } = useToast();

  const fetchTeamProjects = async () => {
    if (!teamId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching team projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading projects",
        description: "Please try again later.",
      });
    }
  };

  const fetchRecentTasks = async () => {
    if (!teamId) return;

    try {
      const { data, error } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          description,
          due_date,
          completed,
          project_id,
          created_at,
          assigned_to,
          projects!inner(
            id,
            name,
            team_id
          )
        `)
        .eq('projects.team_id', teamId)
        .eq('completed', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(10);

      if (error) throw error;

      // Get assigned user names
      const assignedUserIds = (data || [])
        .map(task => task.assigned_to)
        .filter(Boolean) as string[];

      const { data: profiles } = assignedUserIds.length > 0 
        ? await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', assignedUserIds)
        : { data: [] };

      const processedTasks = (data || []).map(task => {
        const assignedProfile = profiles?.find(p => p.user_id === task.assigned_to);
        return {
          ...task,
          project_name: task.projects?.name || 'Unknown Project',
          assigned_to_name: assignedProfile?.full_name || null
        };
      });

      setTasks(processedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamProjects();
    fetchRecentTasks();
  }, [teamId]);

  const markTaskComplete = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');

      // Get task details before updating
      const { data: taskData } = await supabase
        .from('project_schedule_of_works')
        .select('title, project_id')
        .eq('id', taskId)
        .single();

      const { error } = await supabase
        .from('project_schedule_of_works')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Trigger notification for task completion
      if (taskData && teamId) {
        try {
          await supabase.rpc('create_task_completion_notification', {
            p_task_id: taskId,
            p_completed_by: user.id,
            p_project_id: taskData.project_id,
            p_team_id: teamId,
            p_task_title: taskData.title
          });
        } catch (notifError) {
          console.warn('Failed to create task completion notification:', notifError);
        }
      }

      toast({
        title: "Task completed",
        description: "Task has been marked as complete.",
      });

      fetchRecentTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        variant: "destructive",
        title: "Error completing task",
        description: "Please try again.",
      });
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-400' };
    } else {
      return { text: `Due ${date.toLocaleDateString()}`, color: 'text-gray-400' };
    }
  };

  // Show project plan view if a project is selected
  if (selectedProject) {
    return (
      <ProjectPlanView
        projectId={selectedProject.id}
        teamId={teamId}
        projectName={selectedProject.name}
        projectDescription={selectedProject.description || undefined}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white">Project Plans</h3>
        <p className="text-gray-400 mt-1">
          Manage timelines and schedules for {teamName} projects
        </p>
      </div>

      {/* Project Plans Grid */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Projects Yet</h3>
            <p className="text-sm text-gray-400">Create your first team project to start planning timelines</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-emerald-600/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </CardTitle>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.description && (
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 capitalize">
                          {project.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <BarChart3 className="h-3 w-3" />
                          <span>View Plan</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tasks Summary */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-white">Recent Active Tasks</h4>
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
              {tasks.length} active
            </Badge>
          </div>
          
          <div className="grid gap-3">
            {tasks.slice(0, 5).map((task) => {
              const dueDateInfo = formatDueDate(task.due_date);
              
              return (
                <Card key={task.id} className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-white truncate">{task.title}</h5>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs">
                            {task.project_name}
                          </Badge>
                          {task.assigned_to_name && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <User className="w-3 h-3" />
                              {task.assigned_to_name}
                            </div>
                          )}
                          {dueDateInfo && (
                            <div className={`flex items-center gap-1 text-xs ${dueDateInfo.color}`}>
                              <Clock className="w-3 h-3" />
                              {dueDateInfo.text}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          markTaskComplete(task.id);
                        }}
                        className="ml-4 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamProjectPlanView;
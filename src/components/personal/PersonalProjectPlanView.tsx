import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowRight, CheckSquare, Clock, User, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProjectPlanView } from '../team/ProjectPlanView';

interface PersonalProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface PersonalTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  project_id: string;
  project_name: string;
  created_at: string;
}

interface PersonalProjectPlanViewProps {
  userId: string;
}

const PersonalProjectPlanView = ({ userId }: PersonalProjectPlanViewProps) => {
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PersonalProject | null>(null);
  const { toast } = useToast();

  const fetchPersonalProjects = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status, created_at')
        .eq('user_id', userId)
        .is('team_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching personal projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading projects",
        description: "Please try again later.",
      });
    }
  };

  const fetchRecentTasks = async () => {
    if (!userId) return;

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
          projects!inner(
            id,
            name,
            user_id,
            team_id
          )
        `)
        .eq('projects.user_id', userId)
        .is('projects.team_id', null)
        .eq('completed', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(10);

      if (error) throw error;

      const tasksWithProjectName = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        completed: task.completed,
        project_id: task.project_id,
        project_name: task.projects.name,
        created_at: task.created_at
      }));

      setTasks(tasksWithProjectName);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPersonalProjects(),
        fetchRecentTasks()
      ]);
      setLoading(false);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If a specific project is selected, show the detailed project plan view
  if (selectedProject) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedProject(null)}
            className="text-gray-400 hover:text-white flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white truncate">{selectedProject.name}</h2>
            <p className="text-gray-400 text-sm">Project Plan & Schedule</p>
          </div>
        </div>
        
        <ProjectPlanView 
          projectId={selectedProject.id}
          teamId=""
          projectName={selectedProject.name}
          projectDescription={selectedProject.description || undefined}
          onBack={() => setSelectedProject(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Project Plans</h2>
        <p className="text-gray-400">Manage your personal project schedules and milestones</p>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Your Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer border border-gray-600/30 hover:border-gray-500/50"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                  <p className="text-gray-400">
                    Create your first project to start planning and tracking progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks Sidebar */}
        <div>
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length > 0 ? (
                tasks.slice(0, 5).map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const project = projects.find(p => p.id === task.project_id);
                      if (project) setSelectedProject(project);
                    }}
                  >
                    <h4 className="text-white font-medium text-sm">{task.title}</h4>
                    <p className="text-gray-400 text-xs">{task.project_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400 text-xs">
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No upcoming tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalProjectPlanView;
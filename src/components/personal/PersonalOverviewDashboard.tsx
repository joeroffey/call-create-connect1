import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  CheckSquare, 
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PersonalStats {
  projectCount: number;
  activeTaskCount: number;
  completedTaskCount: number;
  documentCount: number;
}

interface RecentProject {
  id: string;
  name: string;
  status: string;
  updated_at: string;
  description: string | null;
}

interface RecentTask {
  id: string;
  title: string;
  due_date: string | null;
  project_name: string;
  project_id: string;
}

interface PersonalOverviewDashboardProps {
  userId: string;
  onCreateProject: () => void;
  onViewProject: (projectId: string) => void;
}

const PersonalOverviewDashboard = ({ userId, onCreateProject, onViewProject }: PersonalOverviewDashboardProps) => {
  const [stats, setStats] = useState<PersonalStats>({
    projectCount: 0,
    activeTaskCount: 0,
    completedTaskCount: 0,
    documentCount: 0
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchPersonalStats();
      fetchRecentProjects();
      fetchRecentTasks();
    }
  }, [userId]);

  const fetchPersonalStats = async () => {
    try {
      // Get project count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('team_id', null);

      // Get active task count
      const { count: activeTaskCount } = await supabase
        .from('project_schedule_of_works')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.user_id', userId)
        .is('projects.team_id', null)
        .eq('completed', false);

      // Get completed task count
      const { count: completedTaskCount } = await supabase
        .from('project_schedule_of_works')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.user_id', userId)
        .is('projects.team_id', null)
        .eq('completed', true);

      // Get document count
      const { count: documentCount } = await supabase
        .from('project_documents')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.user_id', userId)
        .is('projects.team_id', null);

      setStats({
        projectCount: projectCount || 0,
        activeTaskCount: activeTaskCount || 0,
        completedTaskCount: completedTaskCount || 0,
        documentCount: documentCount || 0
      });
    } catch (error) {
      console.error('Error fetching personal stats:', error);
      toast({
        variant: "destructive",
        title: "Error loading statistics",
        description: "Please try again later.",
      });
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status, updated_at, description')
        .eq('user_id', userId)
        .is('team_id', null)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentProjects(data || []);
    } catch (error) {
      console.error('Error fetching recent projects:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          due_date,
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
        .limit(5);

      if (error) throw error;

      const tasksWithProjectName = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        due_date: task.due_date,
        project_name: task.projects.name,
        project_id: task.projects.id
      }));

      setRecentTasks(tasksWithProjectName);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPersonalStats(),
        fetchRecentProjects(),
        fetchRecentTasks()
      ]);
      setLoading(false);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Personal Overview</h2>
        <Button onClick={onCreateProject} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.projectCount}</p>
                <p className="text-sm text-gray-400">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.activeTaskCount}</p>
                <p className="text-sm text-gray-400">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckSquare className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.completedTaskCount}</p>
                <p className="text-sm text-gray-400">Completed Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.documentCount}</p>
                <p className="text-sm text-gray-400">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => onViewProject(project.id)}
                >
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{project.name}</h4>
                    <p className="text-gray-400 text-sm">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No projects yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => onViewProject(task.project_id)}
                >
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{task.title}</h4>
                    <p className="text-gray-400 text-sm">{task.project_name}</p>
                  </div>
                  <div className="text-right">
                    {task.due_date && (
                      <p className="text-gray-400 text-sm">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No upcoming tasks</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalOverviewDashboard;
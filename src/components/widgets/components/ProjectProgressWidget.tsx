import React, { useEffect, useState } from 'react';
import { TrendingUp, Circle } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProjectProgress {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  status: string;
}

const ProjectProgressWidget: React.FC<BaseWidgetProps> = (props) => {
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectProgress();
  }, []);

  const fetchProjectProgress = async () => {
    try {
      // Get projects with task counts
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          project_schedule_of_works(id, completed)
        `)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (projects) {
        const projectProgress = projects.map(project => {
          const tasks = project.project_schedule_of_works || [];
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.completed).length;
          const completionPercentage = totalTasks > 0 
            ? Math.round((completedTasks / totalTasks) * 100) 
            : 0;

          return {
            id: project.id,
            name: project.name,
            totalTasks,
            completedTasks,
            completionPercentage,
            status: project.status
          };
        });

        setProjects(projectProgress);
      }
    } catch (error) {
      console.error('Error fetching project progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-emerald-400';
      case 'on_hold': return 'text-yellow-400';
      case 'planning': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <BaseWidget
      {...props}
      title="Project Progress"
      icon={TrendingUp}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Circle className={`w-2 h-2 fill-current ${getStatusColor(project.status)}`} />
                  <span className="text-sm text-white font-medium truncate">
                    {project.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {project.completionPercentage}%
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.completionPercentage)}`}
                    style={{ width: `${project.completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {project.completedTasks}/{project.totalTasks}
                </span>
              </div>
            </div>
          ))}

          {/* Overall summary */}
          <div className="border-t border-gray-700 pt-3 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {projects.length > 0 
                  ? Math.round(projects.reduce((sum, p) => sum + p.completionPercentage, 0) / projects.length)
                  : 0}%
              </div>
              <div className="text-xs text-gray-400">Average Progress</div>
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default ProjectProgressWidget;
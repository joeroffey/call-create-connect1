import React, { useState, useEffect } from 'react';
import { FileText, BarChart3 } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
}

const ProjectStatsWidget: React.FC<BaseWidgetProps> = (props) => {
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectStats();
  }, []);

  const fetchProjectStats = async () => {
    try {
      setLoading(true);
      
      // Get total projects count
      const { count: total } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .is('team_id', null);

      // Get projects by status
      const { data: projects } = await supabase
        .from('projects')
        .select('status')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .is('team_id', null);

      const statusCounts = projects?.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({
        total: total || 0,
        active: statusCounts['active'] || 0,
        completed: statusCounts['completed'] || 0,
        planning: statusCounts['planning'] || 0
      });
    } catch (error) {
      console.error('Error fetching project stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseWidget {...props} title="Project Statistics" icon={FileText}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props} title="Project Statistics" icon={FileText}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.planning}</div>
            <div className="text-xs text-gray-400">Planning</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Completion Rate
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default ProjectStatsWidget;
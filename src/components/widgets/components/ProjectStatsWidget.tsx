import React, { useEffect, useState } from 'react';
import { FileText, FolderOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProjectStats {
  total: number;
  byStatus: {
    planning: number;
    active: number;
    on_hold: number;
    completed: number;
  };
  overdue: number;
}

const ProjectStatsWidget: React.FC<BaseWidgetProps> = (props) => {
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    byStatus: { planning: 0, active: 0, on_hold: 0, completed: 0 },
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectStats();
  }, []);

  const fetchProjectStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get all projects user has access to
      const { data: projects } = await supabase
        .from('projects')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (projects) {
        const total = projects.length;
        const byStatus = {
          planning: projects.filter(p => p.status === 'planning').length,
          active: projects.filter(p => p.status === 'active').length,
          on_hold: projects.filter(p => p.status === 'on_hold').length,
          completed: projects.filter(p => p.status === 'completed').length,
        };

        // Calculate overdue (simplified - projects active for more than 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const overdue = projects.filter(p => 
          p.status === 'active' && new Date(p.created_at) < sixMonthsAgo
        ).length;

        setStats({ total, byStatus, overdue });
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <FolderOpen className="w-4 h-4" />;
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-400';
      case 'active': return 'text-green-400';
      case 'completed': return 'text-emerald-400';
      case 'on_hold': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <BaseWidget
      {...props}
      title="Project Statistics"
      icon={FileText}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Projects</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                  </span>
                  <span className="text-xs text-gray-300 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </div>

          {stats.overdue > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/30 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-300">Overdue</span>
              </div>
              <span className="font-semibold text-red-400">{stats.overdue}</span>
            </div>
          )}
        </div>
      )}
    </BaseWidget>
  );
};

export default ProjectStatsWidget;
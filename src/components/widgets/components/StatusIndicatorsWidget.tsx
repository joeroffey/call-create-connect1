import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface StatusIndicator {
  id: string;
  type: 'overdue' | 'at_risk' | 'stalled' | 'healthy';
  title: string;
  description: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
}

const StatusIndicatorsWidget: React.FC<BaseWidgetProps> = (props) => {
  const [indicators, setIndicators] = useState<StatusIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusIndicators();
  }, []);

  const fetchStatusIndicators = async () => {
    try {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      // Get overdue tasks
      const { data: overdueTasks } = await supabase
        .from('project_schedule_of_works')
        .select('id')
        .eq('completed', false)
        .not('due_date', 'is', null)
        .lt('due_date', now.toISOString().split('T')[0]);

      // Get projects with no recent activity
      const { data: stalledProjects } = await supabase
        .from('projects')
        .select('id, updated_at')
        .eq('status', 'active')
        .lt('updated_at', monthAgo.toISOString());

      // Get projects at risk (many overdue tasks)
      const { data: projectsWithOverdue } = await supabase
        .from('project_schedule_of_works')
        .select('project_id')
        .eq('completed', false)
        .not('due_date', 'is', null)
        .lt('due_date', now.toISOString().split('T')[0]);

      // Count unique projects with overdue tasks
      const uniqueProjectsAtRisk = new Set(projectsWithOverdue?.map(t => t.project_id) || []);

      // Get healthy projects (recent activity, no overdue tasks)
      const { data: allActiveProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

      const totalActiveProjects = allActiveProjects?.length || 0;
      const problemProjects = uniqueProjectsAtRisk.size + (stalledProjects?.length || 0);
      const healthyProjects = Math.max(0, totalActiveProjects - problemProjects);

      const statusIndicators: StatusIndicator[] = [];

      // Overdue tasks
      if ((overdueTasks?.length || 0) > 0) {
        statusIndicators.push({
          id: 'overdue',
          type: 'overdue',
          title: 'Overdue Tasks',
          description: 'Tasks past their due date',
          count: overdueTasks?.length || 0,
          severity: (overdueTasks?.length || 0) > 5 ? 'high' : 'medium'
        });
      }

      // Projects at risk
      if (uniqueProjectsAtRisk.size > 0) {
        statusIndicators.push({
          id: 'at_risk',
          type: 'at_risk',
          title: 'Projects at Risk',
          description: 'Projects with overdue tasks',
          count: uniqueProjectsAtRisk.size,
          severity: uniqueProjectsAtRisk.size > 2 ? 'high' : 'medium'
        });
      }

      // Stalled projects
      if ((stalledProjects?.length || 0) > 0) {
        statusIndicators.push({
          id: 'stalled',
          type: 'stalled',
          title: 'Stalled Projects',
          description: 'No activity in 30+ days',
          count: stalledProjects?.length || 0,
          severity: 'medium'
        });
      }

      // Healthy projects
      if (healthyProjects > 0 || statusIndicators.length === 0) {
        statusIndicators.push({
          id: 'healthy',
          type: 'healthy',
          title: 'Healthy Projects',
          description: 'On track with recent activity',
          count: healthyProjects,
          severity: 'low'
        });
      }

      setIndicators(statusIndicators);
    } catch (error) {
      console.error('Error fetching status indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'at_risk': return <AlertCircle className="w-4 h-4" />;
      case 'stalled': return <Clock className="w-4 h-4" />;
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getIndicatorColor = (type: string, severity: string) => {
    switch (type) {
      case 'overdue': return 'text-red-400 border-red-500/30 bg-red-900/20';
      case 'at_risk': return 'text-orange-400 border-orange-500/30 bg-orange-900/20';
      case 'stalled': return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
      case 'healthy': return 'text-green-400 border-green-500/30 bg-green-900/20';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-900/20';
    }
  };

  const getSeverityIndicator = (severity: string) => {
    switch (severity) {
      case 'high': return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'medium': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'low': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default: return null;
    }
  };

  return (
    <BaseWidget
      {...props}
      title="Status Indicators"
      icon={AlertCircle}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : indicators.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 text-sm">All systems healthy</p>
        </div>
      ) : (
        <div className="space-y-2">
          {indicators.map(indicator => (
            <div 
              key={indicator.id}
              className={`p-3 rounded border ${getIndicatorColor(indicator.type, indicator.severity)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getIndicatorIcon(indicator.type)}
                  <span className="font-medium text-sm">{indicator.title}</span>
                  {getSeverityIndicator(indicator.severity)}
                </div>
                <span className="font-bold text-lg">{indicator.count}</span>
              </div>
              <p className="text-xs opacity-80">{indicator.description}</p>
            </div>
          ))}

          {/* Overall health score */}
          <div className="border-t border-gray-700 pt-3 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {indicators.filter(i => i.type === 'healthy').length > 0 ? 'Good' : 
                   indicators.filter(i => i.severity === 'high').length > 0 ? 'Needs Attention' : 'Fair'} Health
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default StatusIndicatorsWidget;
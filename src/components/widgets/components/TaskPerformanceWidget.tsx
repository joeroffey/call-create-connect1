import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface TaskStats {
  active: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

const TaskPerformanceWidget: React.FC<BaseWidgetProps> = (props) => {
  const [stats, setStats] = useState<TaskStats>({
    active: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Get active tasks
      const { count: active } = await supabase
        .from('project_schedule_of_works')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.user_id', user.id)
        .is('projects.team_id', null)
        .eq('completed', false);

      // Get completed tasks (this week)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: completed } = await supabase
        .from('project_schedule_of_works')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.user_id', user.id)
        .is('projects.team_id', null)
        .eq('completed', true)
        .gte('completed_at', weekAgo.toISOString());

      // Get overdue tasks
      const today = new Date().toISOString().split('T')[0];
      const { count: overdue } = await supabase
        .from('project_schedule_of_works')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('projects.user_id', user.id)
        .is('projects.team_id', null)
        .eq('completed', false)
        .lt('due_date', today);

      // Calculate completion rate
      const total = (active || 0) + (completed || 0);
      const completionRate = total > 0 ? ((completed || 0) / total) * 100 : 0;

      setStats({
        active: active || 0,
        completed: completed || 0,
        overdue: overdue || 0,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseWidget {...props} title="Task Performance" icon={CheckSquare}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props} title="Task Performance" icon={CheckSquare}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-blue-400">{stats.active}</div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Active
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <CheckSquare className="w-3 h-3" />
              This Week
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-400">{stats.overdue}</div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Overdue
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Completion Rate</span>
            <span className="text-xs text-white font-medium">
              {Math.round(stats.completionRate)}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {stats.overdue > 0 && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-2">
            <div className="text-xs text-red-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {stats.overdue} task{stats.overdue > 1 ? 's' : ''} overdue
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default TaskPerformanceWidget;
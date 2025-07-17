import React, { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
  recentCompleted: number;
}

const TaskPerformanceWidget: React.FC<BaseWidgetProps> = (props) => {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
    recentCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const fetchTaskStats = async () => {
    try {
      // Get all tasks from accessible projects
      const { data: tasks } = await supabase
        .from('project_schedule_of_works')
        .select('completed, due_date, completed_at')
        .order('created_at', { ascending: false });

      if (tasks) {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const overdue = tasks.filter(t => 
          !t.completed && t.due_date && new Date(t.due_date) < now
        ).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const recentCompleted = tasks.filter(t => 
          t.completed && t.completed_at && new Date(t.completed_at) > weekAgo
        ).length;

        setStats({ total, completed, overdue, completionRate, recentCompleted });
      }
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseWidget
      {...props}
      title="Task Performance"
      icon={CheckSquare}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
            <div className="text-sm text-gray-400">Completion Rate</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Completed</span>
              </div>
              <span className="font-semibold text-white">{stats.completed}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Total Tasks</span>
              </div>
              <span className="font-semibold text-white">{stats.total}</span>
            </div>

            {stats.overdue > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/30 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Overdue</span>
                </div>
                <span className="font-semibold text-red-400">{stats.overdue}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-2 bg-emerald-900/20 border border-emerald-500/30 rounded">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">This Week</span>
              </div>
              <span className="font-semibold text-emerald-400">{stats.recentCompleted}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default TaskPerformanceWidget;
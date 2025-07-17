import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, Clock, Zap } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProductivityMetrics {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  averageCompletionTime: number;
  velocityTrend: 'up' | 'down' | 'stable';
  streakDays: number;
  focusScore: number;
}

const ProductivityMetricsWidget: React.FC<BaseWidgetProps> = (props) => {
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    tasksCompletedToday: 0,
    tasksCompletedThisWeek: 0,
    averageCompletionTime: 0,
    velocityTrend: 'stable',
    streakDays: 0,
    focusScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductivityMetrics();
  }, []);

  const fetchProductivityMetrics = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(weekStart.getDate() - 7);

      // Get completed tasks with timing data
      const { data: completedTasks } = await supabase
        .from('project_schedule_of_works')
        .select('completed_at, created_at, due_date')
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (completedTasks) {
        // Tasks completed today
        const tasksCompletedToday = completedTasks.filter(task => {
          const completedDate = new Date(task.completed_at);
          return completedDate >= today;
        }).length;

        // Tasks completed this week
        const tasksCompletedThisWeek = completedTasks.filter(task => {
          const completedDate = new Date(task.completed_at);
          return completedDate >= weekStart;
        }).length;

        // Tasks completed last week for velocity comparison
        const tasksCompletedLastWeek = completedTasks.filter(task => {
          const completedDate = new Date(task.completed_at);
          return completedDate >= lastWeekStart && completedDate < weekStart;
        }).length;

        // Calculate velocity trend
        let velocityTrend: 'up' | 'down' | 'stable' = 'stable';
        if (tasksCompletedThisWeek > tasksCompletedLastWeek) {
          velocityTrend = 'up';
        } else if (tasksCompletedThisWeek < tasksCompletedLastWeek) {
          velocityTrend = 'down';
        }

        // Calculate average completion time (days from creation to completion)
        const tasksWithDuration = completedTasks
          .filter(task => task.created_at && task.completed_at)
          .map(task => {
            const created = new Date(task.created_at);
            const completed = new Date(task.completed_at);
            return Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          });

        const averageCompletionTime = tasksWithDuration.length > 0
          ? Math.round(tasksWithDuration.reduce((sum, days) => sum + days, 0) / tasksWithDuration.length)
          : 0;

        // Calculate streak (consecutive days with completed tasks)
        let streakDays = 0;
        let checkDate = new Date(today);
        while (streakDays < 30) { // Limit check to last 30 days
          const dayTasks = completedTasks.filter(task => {
            const completedDate = new Date(task.completed_at);
            return completedDate.toDateString() === checkDate.toDateString();
          });
          
          if (dayTasks.length > 0) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate focus score (tasks completed vs tasks due this week)
        const { data: dueTasks } = await supabase
          .from('project_schedule_of_works')
          .select('id')
          .gte('due_date', weekStart.toISOString().split('T')[0])
          .lt('due_date', new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const totalDueThisWeek = dueTasks?.length || 0;
        const focusScore = totalDueThisWeek > 0 
          ? Math.round((tasksCompletedThisWeek / totalDueThisWeek) * 100)
          : tasksCompletedThisWeek > 0 ? 100 : 0;

        setMetrics({
          tasksCompletedToday,
          tasksCompletedThisWeek,
          averageCompletionTime,
          velocityTrend,
          streakDays,
          focusScore: Math.min(100, focusScore)
        });
      }
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVelocityIcon = () => {
    switch (metrics.velocityTrend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVelocityColor = () => {
    switch (metrics.velocityTrend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <BaseWidget
      {...props}
      title="Productivity Metrics"
      icon={TrendingUp}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{metrics.focusScore}%</div>
            <div className="text-sm text-gray-400">Focus Score</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-semibold text-white">{metrics.tasksCompletedToday}</div>
              <div className="text-xs text-gray-400">Today</div>
            </div>

            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="font-semibold text-white">{metrics.tasksCompletedThisWeek}</div>
              <div className="text-xs text-gray-400">This Week</div>
            </div>

            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="font-semibold text-white">{metrics.averageCompletionTime}d</div>
              <div className="text-xs text-gray-400">Avg. Time</div>
            </div>

            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                {getVelocityIcon()}
              </div>
              <div className={`font-semibold ${getVelocityColor()}`}>
                {metrics.velocityTrend === 'up' ? '↑' : metrics.velocityTrend === 'down' ? '↓' : '→'}
              </div>
              <div className="text-xs text-gray-400">Velocity</div>
            </div>
          </div>

          {/* Streak and focus indicators */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-emerald-900/20 border border-emerald-500/30 rounded">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm text-emerald-300">Streak</span>
              </div>
              <span className="font-semibold text-emerald-400">
                {metrics.streakDays} day{metrics.streakDays !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.focusScore >= 80 ? 'bg-emerald-500' :
                  metrics.focusScore >= 60 ? 'bg-green-500' :
                  metrics.focusScore >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${metrics.focusScore}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default ProductivityMetricsWidget;
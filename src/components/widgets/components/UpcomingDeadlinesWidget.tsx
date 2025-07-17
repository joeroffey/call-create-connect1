import React, { useEffect, useState } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface DeadlineItem {
  id: string;
  title: string;
  due_date: string;
  project_name: string;
  is_overdue: boolean;
  days_until: number;
}

const UpcomingDeadlinesWidget: React.FC<BaseWidgetProps> = (props) => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingDeadlines();
  }, []);

  const fetchUpcomingDeadlines = async () => {
    try {
      const { data: tasks } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          due_date,
          completed,
          projects!inner(name)
        `)
        .eq('completed', false)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(5);

      if (tasks) {
        const now = new Date();
        const formattedDeadlines = tasks.map(task => {
          const dueDate = new Date(task.due_date);
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            id: task.id,
            title: task.title,
            due_date: task.due_date,
            project_name: task.projects?.name || 'Unknown Project',
            is_overdue: diffDays < 0,
            days_until: diffDays
          };
        });

        setDeadlines(formattedDeadlines);
      }
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDueDate = (daysUntil: number) => {
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} days overdue`;
    } else if (daysUntil === 0) {
      return 'Due today';
    } else if (daysUntil === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntil} days`;
    }
  };

  const getUrgencyColor = (daysUntil: number, isOverdue: boolean) => {
    if (isOverdue) return 'text-red-400 border-red-500/30 bg-red-900/20';
    if (daysUntil <= 1) return 'text-orange-400 border-orange-500/30 bg-orange-900/20';
    if (daysUntil <= 7) return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
    return 'text-blue-400 border-blue-500/30 bg-blue-900/20';
  };

  return (
    <BaseWidget
      {...props}
      title="Upcoming Deadlines"
      icon={Clock}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : deadlines.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No upcoming deadlines</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deadlines.map(deadline => (
            <div 
              key={deadline.id}
              className={`p-3 rounded border ${getUrgencyColor(deadline.days_until, deadline.is_overdue)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm truncate">
                    {deadline.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    {deadline.project_name}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {deadline.is_overdue && (
                    <AlertCircle className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
              <div className="mt-1">
                <span className="text-xs font-medium">
                  {formatDueDate(deadline.days_until)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
};

export default UpcomingDeadlinesWidget;
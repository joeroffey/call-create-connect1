import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Calendar } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  projectName: string;
  isOverdue: boolean;
  daysUntilDue: number;
}

const UpcomingDeadlinesWidget: React.FC<BaseWidgetProps> = (props) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingDeadlines();
  }, []);

  const fetchUpcomingDeadlines = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data: tasks } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          due_date,
          projects!inner(name, user_id, team_id)
        `)
        .eq('projects.user_id', user.id)
        .is('projects.team_id', null)
        .eq('completed', false)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(10);

      const now = new Date();
      const deadlinesList: Deadline[] = tasks?.map(task => {
        const dueDate = new Date(task.due_date);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: task.id,
          title: task.title,
          dueDate: task.due_date,
          projectName: task.projects.name,
          isOverdue: diffDays < 0,
          daysUntilDue: diffDays
        };
      }) || [];

      // Sort by urgency: overdue first, then by days until due
      deadlinesList.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.daysUntilDue - b.daysUntilDue;
      });

      setDeadlines(deadlinesList.slice(0, 6));
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDueDateBadge = (deadline: Deadline) => {
    if (deadline.isOverdue) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    
    if (deadline.daysUntilDue === 0) {
      return (
        <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
          <Clock className="w-3 h-3 mr-1" />
          Today
        </Badge>
      );
    }
    
    if (deadline.daysUntilDue === 1) {
      return (
        <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
          <Clock className="w-3 h-3 mr-1" />
          Tomorrow
        </Badge>
      );
    }
    
    if (deadline.daysUntilDue <= 7) {
      return (
        <Badge variant="secondary" className="text-xs">
          {deadline.daysUntilDue}d
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs border-gray-600">
        {deadline.daysUntilDue}d
      </Badge>
    );
  };

  if (loading) {
    return (
      <BaseWidget {...props} title="Upcoming Deadlines" icon={Clock}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props} title="Upcoming Deadlines" icon={Clock}>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {deadlines.length > 0 ? (
          deadlines.map((deadline) => (
            <div 
              key={deadline.id} 
              className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {deadline.title}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {deadline.projectName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Due: {new Date(deadline.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                {getDueDateBadge(deadline)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No upcoming deadlines</p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default UpcomingDeadlinesWidget;
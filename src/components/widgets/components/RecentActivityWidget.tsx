import React, { useState, useEffect } from 'react';
import { Activity, FileText, CheckSquare, Calendar } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'project' | 'task' | 'document';
  title: string;
  action: string;
  timestamp: string;
  projectName?: string;
}

const RecentActivityWidget: React.FC<BaseWidgetProps> = (props) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const activities: ActivityItem[] = [];

      // Get recent projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, updated_at, status')
        .eq('user_id', user.id)
        .is('team_id', null)
        .order('updated_at', { ascending: false })
        .limit(5);

      projects?.forEach(project => {
        activities.push({
          id: project.id,
          type: 'project',
          title: project.name,
          action: `Project ${project.status}`,
          timestamp: project.updated_at
        });
      });

      // Get recent tasks
      const { data: tasks } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          updated_at,
          completed,
          projects!inner(name, user_id, team_id)
        `)
        .eq('projects.user_id', user.id)
        .is('projects.team_id', null)
        .order('updated_at', { ascending: false })
        .limit(5);

      tasks?.forEach(task => {
        activities.push({
          id: task.id,
          type: 'task',
          title: task.title,
          action: task.completed ? 'Task completed' : 'Task updated',
          timestamp: task.updated_at,
          projectName: task.projects.name
        });
      });

      // Get recent documents
      const { data: documents } = await supabase
        .from('project_documents')
        .select(`
          id,
          file_name,
          created_at,
          projects!inner(name, user_id, team_id)
        `)
        .eq('projects.user_id', user.id)
        .is('projects.team_id', null)
        .order('created_at', { ascending: false })
        .limit(3);

      documents?.forEach(doc => {
        activities.push({
          id: doc.id,
          type: 'document',
          title: doc.file_name,
          action: 'Document uploaded',
          timestamp: doc.created_at,
          projectName: doc.projects.name
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return FileText;
      case 'task': return CheckSquare;
      case 'document': return FileText;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-blue-400';
      case 'task': return 'text-green-400';
      case 'document': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <BaseWidget {...props} title="Recent Activity" icon={Activity}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props} title="Recent Activity" icon={Activity}>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className={`p-1.5 rounded-lg bg-gray-800/50`}>
                  <Icon className={`w-3 h-3 ${getActivityColor(activity.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">
                    {activity.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.action}
                    {activity.projectName && (
                      <span className="text-gray-500"> • {activity.projectName}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default RecentActivityWidget;
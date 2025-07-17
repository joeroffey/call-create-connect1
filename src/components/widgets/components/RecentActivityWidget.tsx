import React, { useEffect, useState } from 'react';
import { Activity, FileText, CheckSquare, Upload } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'document_uploaded' | 'project_created';
  title: string;
  description: string;
  timestamp: string;
}

const RecentActivityWidget: React.FC<BaseWidgetProps> = (props) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent completed tasks
      const { data: recentTasks } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          completed_at,
          projects!inner(name)
        `)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(3);

      // Fetch recent documents
      const { data: recentDocs } = await supabase
        .from('project_completion_documents')
        .select(`
          id,
          file_name,
          created_at,
          projects!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent projects
      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      const activities: ActivityItem[] = [];

      // Add task completions
      recentTasks?.forEach(task => {
        activities.push({
          id: `task-${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `${task.title} in ${task.projects?.name}`,
          timestamp: task.completed_at
        });
      });

      // Add document uploads
      recentDocs?.forEach(doc => {
        activities.push({
          id: `doc-${doc.id}`,
          type: 'document_uploaded',
          title: 'Document Uploaded',
          description: `${doc.file_name} to ${doc.projects?.name}`,
          timestamp: doc.created_at
        });
      });

      // Add project creations
      recentProjects?.forEach(project => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project_created',
          title: 'Project Created',
          description: project.name,
          timestamp: project.created_at
        });
      });

      // Sort by timestamp and take top 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckSquare className="w-4 h-4 text-green-400" />;
      case 'document_uploaded': return <Upload className="w-4 h-4 text-blue-400" />;
      case 'project_created': return <FileText className="w-4 h-4 text-emerald-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <BaseWidget
      {...props}
      title="Recent Activity"
      icon={Activity}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-800/30 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
};

export default RecentActivityWidget;
import React from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  UserPlus,
  Share2,
  CheckCircle
} from 'lucide-react';

interface TeamActivityItemProps {
  activity: {
    id: string;
    user_id: string;
    action: string;
    target_type: string | null;
    target_id: string | null;
    metadata: any;
    created_at: string;
    profiles?: {
      full_name: string | null;
    } | null;
  };
}

const TeamActivityItem = ({ activity }: TeamActivityItemProps) => {
  const getActivityIcon = (action: string, targetType?: string | null) => {
    switch (action) {
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'project_shared':
        return <Share2 className="w-4 h-4 text-blue-400" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'project_created':
        return <FileText className="w-4 h-4 text-orange-400" />;
      case 'task_assigned':
        return <Calendar className="w-4 h-4 text-yellow-400" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityDescription = (action: string, metadata: any, targetType?: string | null) => {
    const userName = activity.profiles?.full_name || 'Unknown User';
    
    switch (action) {
      case 'member_joined':
        return `${userName} joined the team`;
      case 'project_shared':
        return `${userName} shared project "${metadata?.project_name || 'Unknown Project'}"`;
      case 'task_completed':
        return `${userName} completed task "${metadata?.task_title || 'Unknown Task'}"`;
      case 'comment_added':
        return `${userName} added a comment`;
      case 'project_created':
        return `${userName} created project "${metadata?.project_name || 'Unknown Project'}"`;
      case 'task_assigned':
        return `${userName} assigned a task`;
      default:
        return `${userName} performed an action`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center">
        {getActivityIcon(activity.action, activity.target_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">
          {getActivityDescription(activity.action, activity.metadata, activity.target_type)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTimeAgo(activity.created_at)}
        </p>
      </div>
    </div>
  );
};

export default TeamActivityItem;
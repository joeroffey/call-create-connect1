import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  UserPlus,
  FolderPlus,
  Edit,
  Upload
} from 'lucide-react';
import { useTeamActivity, type TeamActivity } from '@/hooks/useTeamActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamActivityFeedProps {
  teamId: string;
  className?: string;
}

const TeamActivityFeed = ({ teamId, className = '' }: TeamActivityFeedProps) => {
  const { activities, loading, error } = useTeamActivity(teamId, !!teamId);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'task_assigned':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'document_uploaded':
        return <Upload className="w-4 h-4 text-purple-500" />;
      case 'project_created':
        return <FolderPlus className="w-4 h-4 text-emerald-500" />;
      case 'project_updated':
        return <Edit className="w-4 h-4 text-yellow-500" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: TeamActivity) => {
    const metadata = activity.metadata || {};
    
    switch (activity.action) {
      case 'task_assigned':
        return `assigned a task: "${metadata.task_title}" in ${metadata.project_name}`;
      case 'task_completed':
        return `completed task: "${metadata.task_title}" in ${metadata.project_name}`;
      case 'document_uploaded':
        return `uploaded "${metadata.file_name}" to ${metadata.project_name}`;
      case 'project_created':
        return `created project: "${metadata.project_name}"`;
      case 'project_updated':
        return `updated project: "${metadata.project_name}"`;
      case 'member_joined':
        return `joined the team`;
      default:
        return activity.action.replace('_', ' ');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const groupActivitiesByDate = (activities: TeamActivity[]) => {
    const groups: { [key: string]: TeamActivity[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey = '';
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-GB', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-red-400">Failed to load team activity</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-emerald-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No team activity yet</p>
          <p className="text-gray-500 text-sm mt-1">Start collaborating to see activity here</p>
        </CardContent>
      </Card>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-emerald-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-gray-400 mb-3">{date}</h4>
              <div className="space-y-3">
                {dateActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.user_avatar} />
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-300 text-xs">
                        {activity.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.action)}
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-white">{activity.user_name}</span>
                          {' '}
                          {getActivityMessage(activity)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(activity.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamActivityFeed;
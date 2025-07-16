
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  Tag, 
  Filter,
  Search,
  Clock,
  Building,
  Home,
  Factory,
  AlertTriangle,
  Info,
  CheckCircle,
  FileText,
  User,
  CheckCheck,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';


const NotificationsScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount 
  } = useNotifications(user?.id, !!user);

  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.read);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, showUnreadOnly]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('🔔 Notification clicked:', notification);
    console.log('🔄 Current location before navigation:', window.location.href);
    
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    let navUrl: string;
    
    if (notification.type === 'task_assigned') {
      // For task assignments, navigate to TEAM tab with schedule view
      navUrl = `/?tab=team&view=schedule&team=${notification.team_id}&project=${notification.project_id}`;
    } else {
      // For other notification types, navigate to projects tab
      navUrl = `/?tab=projects&project=${notification.project_id}&view=schedule&team=${notification.team_id}`;
    }
    
    console.log('🎯 Navigation URL being generated:', navUrl);
    console.log('🏗️ Notification details:', {
      projectId: notification.project_id,
      teamId: notification.team_id,
      type: notification.type,
      targetType: notification.target_type,
      navigatingToTab: notification.type === 'task_assigned' ? 'team' : 'projects'
    });
    
    navigate(navUrl);
    console.log('✅ Navigation command sent');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <User className="w-4 h-4 text-blue-500" />;
      case 'document_uploaded': return <FileText className="w-4 h-4 text-green-500" />;
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'comment_created': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'project_status_changed': return <Settings className="w-4 h-4 text-orange-500" />;
      case 'project_plan_status_changed': return <Calendar className="w-4 h-4 text-cyan-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_assigned': return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
      case 'document_uploaded': return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'task_completed': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
      case 'comment_created': return 'bg-purple-500/20 border-purple-500/40 text-purple-300';
      case 'project_status_changed': return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
      case 'project_plan_status_changed': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
      default: return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    }
  };

  const formatDate = (dateString: string) => {
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

  const unreadCount = getUnreadCount();

  return (
    <div className="h-full bg-transparent text-white overflow-y-auto">
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400">Stay informed about your team project activities</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {unreadCount > 0 && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex-1 mr-4">
                <p className="text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-6"
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task_assigned">Task Assignments</SelectItem>
                <SelectItem value="document_uploaded">Document Uploads</SelectItem>
                <SelectItem value="task_completed">Task Completions</SelectItem>
                <SelectItem value="comment_created">Comments</SelectItem>
                <SelectItem value="project_status_changed">Project Status</SelectItem>
                <SelectItem value="project_plan_status_changed">Project Plan Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="w-full lg:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Unread Only
            </Button>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Error Loading Notifications</h3>
                <p className="text-gray-400">{error}</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Notifications Found</h3>
                <p className="text-gray-400">
                  {notifications.length === 0 
                    ? "You don't have any notifications yet. Join a team and start collaborating!"
                    : "Try adjusting your filters to see more notifications."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all cursor-pointer ${
                    !notification.read ? 'ring-2 ring-emerald-500/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className={`text-lg ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </CardTitle>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge
                            variant="outline"
                            className={`${getNotificationColor(notification.type)} border text-xs`}
                          >
                            {notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          {notification.metadata?.project_name && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/20 border-emerald-500/40 text-emerald-300">
                              {notification.metadata.project_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-400 mb-4">{notification.message}</p>
                    
                    <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:items-center lg:justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                      
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsScreen;

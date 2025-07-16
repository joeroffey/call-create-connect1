import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTeamStats } from '@/hooks/useTeamStats';
import { 
  UserPlus, 
  FolderPlus, 
  ListTodo, 
  Upload,
  MessageSquare,
  Settings,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InviteMemberModal from '@/components/team/InviteMemberModal';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  bgColor: string;
  badge?: string;
}

interface QuickActionsProps {
  teamId: string;
  onCreateProject?: () => void;
  onCreateTask?: () => void;
  onUploadDocument?: () => void;
  onTeamSettings?: () => void;
  onInviteMember?: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onCreateTestInvitation?: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<string>;
}

const QuickActions = ({ 
  teamId,
  onCreateProject,
  onCreateTask,
  onUploadDocument,
  onTeamSettings,
  onInviteMember,
  onCreateTestInvitation
}: QuickActionsProps) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const stats = useTeamStats(teamId);

  const quickActions: QuickAction[] = [
    {
      id: 'invite',
      title: 'Invite Members',
      description: 'Add new team members',
      icon: <UserPlus className="w-5 h-5" />,
      action: () => setShowInviteModal(true),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 hover:bg-emerald-500/30'
    },
    {
      id: 'project',
      title: 'New Project',
      description: 'Start a new project',
      icon: <FolderPlus className="w-5 h-5" />,
      action: () => onCreateProject?.(),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 hover:bg-blue-500/30'
    },
    {
      id: 'task',
      title: 'Assign Task',
      description: 'Create and assign tasks',
      icon: <ListTodo className="w-5 h-5" />,
      action: () => onCreateTask?.(),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 hover:bg-orange-500/30'
    },
    {
      id: 'upload',
      title: 'Share Document',
      description: 'Upload files to share',
      icon: <Upload className="w-5 h-5" />,
      action: () => onUploadDocument?.(),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 hover:bg-purple-500/30'
    },
    {
      id: 'settings',
      title: 'Team Settings',
      description: 'Manage team preferences',
      icon: <Settings className="w-5 h-5" />,
      action: () => onTeamSettings?.(),
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 hover:bg-gray-500/30'
    }
  ];

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Perform common team actions with a single click
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  onClick={action.action}
                  className={`
                    w-full h-auto p-3 md:p-4 flex flex-col items-start gap-2 
                    ${action.bgColor} border border-gray-600/50 
                    hover:border-gray-500 transition-all group
                    text-left justify-start min-h-[100px] md:min-h-[120px]
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-1.5 md:p-2 rounded-lg ${action.bgColor} ${action.color} flex-shrink-0`}>
                      {action.icon}
                    </div>
                    {action.badge && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-emerald-500/50 text-emerald-400 flex-shrink-0"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 w-full min-w-0">
                    <h4 className="text-white font-medium text-sm md:text-base group-hover:text-gray-200 leading-tight">
                      {action.title}
                    </h4>
                    <p className="text-gray-400 text-xs md:text-sm leading-tight break-words">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="pt-4 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.loading ? '-' : stats.actionsToday}
                </p>
                <p className="text-xs text-gray-500">Actions Today</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.loading ? '-' : stats.actionsThisWeek}
                </p>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.loading ? '-' : stats.actionsThisMonth}
                </p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      {showInviteModal && onInviteMember && onCreateTestInvitation && (
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <InviteMemberModal 
              onInviteMember={onInviteMember}
              onCreateTestInvitation={onCreateTestInvitation}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default QuickActions;
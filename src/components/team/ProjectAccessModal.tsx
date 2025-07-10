import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { Shield, Users, Eye, Edit, Crown } from 'lucide-react';

interface ProjectAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  teamId: string;
  projectName: string;
}

export const ProjectAccessModal: React.FC<ProjectAccessModalProps> = ({
  isOpen,
  onClose,
  projectId,
  teamId,
  projectName,
}) => {
  const { members: teamMembers } = useTeamMembers(teamId);
  const { permissions, grantPermission, revokePermission } = useProjectPermissions(projectId);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const getPermissionLevel = (userId: string) => {
    const permission = permissions.find(p => p.user_id === userId);
    return permission?.permission_level || null;
  };

  const handlePermissionChange = async (userId: string, level: string) => {
    setIsUpdating(userId);
    
    if (level === 'none') {
      await revokePermission(userId);
    } else {
      await grantPermission(userId, teamId, level as 'view' | 'edit' | 'admin');
    }
    
    setIsUpdating(null);
  };

  const getPermissionIcon = (level: string | null) => {
    switch (level) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'admin':
        return <Crown className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (level: string | null) => {
    switch (level) {
      case 'view':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'edit':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Project Access: {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Control who can access this project and what they can do.
          </div>

          {permissions.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700">
                <strong>Default Access:</strong> All team members have full access to this project.
                Add specific permissions below to restrict access.
              </div>
            </div>
          )}

          <div className="space-y-3">
            {teamMembers.map((member) => {
              const currentLevel = getPermissionLevel(member.user_id);
              const isLoading = isUpdating === member.user_id;

              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.profiles?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.profiles?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Team {member.role}
                      </div>
                    </div>
                    {currentLevel && (
                      <Badge variant="outline" className={getPermissionColor(currentLevel)}>
                        {getPermissionIcon(currentLevel)}
                        {currentLevel}
                      </Badge>
                    )}
                  </div>

                  <Select
                    value={currentLevel || 'team'}
                    onValueChange={(value) => handlePermissionChange(member.user_id, value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team">Team Access</SelectItem>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="none">No Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground space-y-2">
              <div><strong>Team Access:</strong> Uses default team permissions</div>
              <div><strong>View Only:</strong> Can view project and documents</div>
              <div><strong>Edit:</strong> Can view and modify project</div>
              <div><strong>Admin:</strong> Can manage project and permissions</div>
              <div><strong>No Access:</strong> Cannot access this project</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
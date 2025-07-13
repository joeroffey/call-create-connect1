import React, { useState } from 'react';
import { Crown, Shield, Users, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RoleSelectProps {
  currentRole: 'owner' | 'admin' | 'member' | 'viewer';
  memberId: string;
  memberName: string;
  onRoleChange: (memberId: string, newRole: 'admin' | 'member' | 'viewer') => void;
  canEdit: boolean;
  isCurrentUser: boolean;
  isOwner: boolean;
  currentUserRole: 'owner' | 'admin' | 'member' | 'viewer' | null;
}

const roleConfig = {
  owner: {
    icon: Crown,
    color: 'text-yellow-500',
    bgColor: 'border-yellow-500/30',
    label: 'Owner',
    description: 'Full access to everything'
  },
  admin: {
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'border-blue-500/30',
    label: 'Admin',
    description: 'Can manage members and projects'
  },
  member: {
    icon: Users,
    color: 'text-emerald-500',
    bgColor: 'border-emerald-500/30',
    label: 'Member',
    description: 'Can create and edit projects'
  },
  viewer: {
    icon: Eye,
    color: 'text-gray-500',
    bgColor: 'border-gray-500/30',
    label: 'Viewer',
    description: 'Can only view projects'
  }
};

export const RoleSelect: React.FC<RoleSelectProps> = ({
  currentRole,
  memberId,
  memberName,
  onRoleChange,
  canEdit,
  isCurrentUser,
  isOwner,
  currentUserRole
}) => {
  const [pendingRole, setPendingRole] = useState<'admin' | 'member' | 'viewer' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRoleSelect = (newRole: 'admin' | 'member' | 'viewer') => {
    if (newRole === currentRole) return;
    
    setPendingRole(newRole);
    setShowConfirmDialog(true);
  };

  const confirmRoleChange = () => {
    if (pendingRole) {
      onRoleChange(memberId, pendingRole);
    }
    setShowConfirmDialog(false);
    setPendingRole(null);
  };

  const cancelRoleChange = () => {
    setShowConfirmDialog(false);
    setPendingRole(null);
  };

  const getCurrentRoleConfig = () => roleConfig[currentRole];
  const IconComponent = getCurrentRoleConfig().icon;

  // Determine which roles can be selected
  const getAvailableRoles = () => {
    const roles: ('admin' | 'member' | 'viewer')[] = [];
    
    if (currentUserRole === 'owner') {
      // Owners can set any role except owner
      roles.push('admin', 'member', 'viewer');
    } else if (currentUserRole === 'admin') {
      // Admins can only manage member and viewer roles
      roles.push('member', 'viewer');
    }
    
    return roles.filter(role => role !== currentRole);
  };

  // If user cannot edit or is viewing their own role (except owners can't change their own role)
  if (!canEdit || isCurrentUser || isOwner) {
    return (
      <Badge 
        variant="outline" 
        className={`${getCurrentRoleConfig().bgColor} ${getCurrentRoleConfig().color} px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm`}
      >
        <IconComponent className="w-4 h-4" />
        <span className="capitalize font-medium">{currentRole}</span>
      </Badge>
    );
  }

  const availableRoles = getAvailableRoles();

  if (availableRoles.length === 0) {
    return (
      <Badge 
        variant="outline" 
        className={`${getCurrentRoleConfig().bgColor} ${getCurrentRoleConfig().color} px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm`}
      >
        <IconComponent className="w-4 h-4" />
        <span className="capitalize font-medium">{currentRole}</span>
      </Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`${getCurrentRoleConfig().bgColor} ${getCurrentRoleConfig().color} hover:bg-gray-700/50 px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto`}
          >
            <IconComponent className="w-4 h-4" />
            <span className="capitalize font-medium">{currentRole}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
          {availableRoles.map((role) => {
            const config = roleConfig[role];
            const RoleIcon = config.icon;
            
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="text-white hover:bg-gray-700 cursor-pointer flex items-start gap-3 p-3"
              >
                <RoleIcon className={`w-4 h-4 ${config.color} mt-0.5`} />
                <div className="flex flex-col">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-gray-400">{config.description}</span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Change Member Role</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to change{' '}
              <span className="font-semibold text-white">{memberName}</span>'s role from{' '}
              <span className="font-semibold capitalize">{currentRole}</span> to{' '}
              <span className="font-semibold capitalize">{pendingRole}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={cancelRoleChange}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
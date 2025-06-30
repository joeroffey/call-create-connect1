
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Clock, Pin, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  conversationCount: number;
  documentCount: number;
  scheduleOfWorksCount: number;
  onStartNewChat: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string, projectName: string) => void;
  onTogglePin: (projectId: string, currentPinned: boolean) => void;
  onProjectStatsClick: (project: Project, section: string) => void;
}

const ProjectCard = ({
  project,
  index,
  conversationCount,
  documentCount,
  scheduleOfWorksCount,
  onStartNewChat,
  onEdit,
  onDelete,
  onTogglePin,
  onProjectStatsClick,
}: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'set-up': // Changed from 'planning'
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'on-hold':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'set-up': // Changed from 'planning'
        return 'Set-Up';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      default:
        return status;
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Residential':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Commercial':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Industrial':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Mixed Use':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <Card className="card-professional hover:border-emerald-500/40 transition-all duration-300 group h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <CardTitle className="text-lg text-white group-hover:text-emerald-300 transition-colors truncate">
                  {project.name}
                </CardTitle>
                {project.pinned && (
                  <Pin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${getLabelColor(project.label)}`}>
                  {project.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
                  {getStatusDisplayName(project.status)}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem 
                  onClick={() => onEdit(project)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onTogglePin(project.id, project.pinned || false)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Pin className="w-4 h-4 mr-2" />
                  {project.pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(project.id, project.name)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="text-gray-400 line-clamp-2">
            {project.description || 'No description provided'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          {/* Project Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onProjectStatsClick(project, 'chats')}
              className="bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{conversationCount}</div>
                  <div className="text-xs text-gray-400">Chats</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onProjectStatsClick(project, 'documents')}
              className="bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-green-400" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{documentCount}</div>
                  <div className="text-xs text-gray-400">Docs</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onProjectStatsClick(project, 'schedule')}
              className="bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" /> {/* Changed from target/milestone icon to clock */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{scheduleOfWorksCount}</div>
                  <div className="text-xs text-gray-400">Tasks</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onStartNewChat(project.id)}
            className="w-full gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
          >
            Start New Chat
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;

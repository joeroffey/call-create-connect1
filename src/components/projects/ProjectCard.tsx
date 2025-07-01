
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Pin, MessageCircle, FileText, Clock, ChevronDown } from 'lucide-react';

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
  onStatusChange: (projectId: string, newStatus: string) => void;
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
  onStatusChange
}: ProjectCardProps) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'on-hold': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Set-up';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'on-hold': return 'On Hold';
      default: return status.replace('-', ' ');
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Residential': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Commercial': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Industrial': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Infrastructure': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleScheduleClick = () => {
    console.log('Schedule button clicked for project:', project.name);
    console.log('Calling onProjectStatsClick with:', project, 'schedule');
    onProjectStatsClick(project, 'schedule');
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(project.id, newStatus);
    setShowStatusDropdown(false);
  };

  const statusOptions = [
    { value: 'planning', label: 'Set-up' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 hover:border-emerald-500/30 transition-all duration-300 group relative ${
        project.pinned 
          ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' 
          : 'border-gray-800/50'
      }`}
    >
      {/* Pin indicator */}
      {project.pinned && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
          <Pin className="w-2 h-2 text-white" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => onTogglePin(project.id, project.pinned || false)}
            className={`p-2 hover:bg-gray-800/50 rounded-lg transition-colors ${
              project.pinned 
                ? 'text-emerald-400 hover:text-emerald-300' 
                : 'text-gray-400 hover:text-white'
            }`}
            title={project.pinned ? 'Unpin project' : 'Pin project to top'}
          >
            <Pin className={`w-4 h-4 ${project.pinned ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status and Label */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:opacity-80 flex items-center space-x-1 ${getStatusColor(project.status)}`}
          >
            <span>{getStatusLabel(project.status)}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-10 min-w-32">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    project.status === option.value ? 'text-emerald-300' : 'text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLabelColor(project.label)}`}>
          {project.label}
        </span>
      </div>

      {/* Click outside to close dropdown */}
      {showStatusDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowStatusDropdown(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-gray-800/30">
        <button
          onClick={() => onProjectStatsClick(project, 'chats')}
          className="text-center hover:bg-gray-800/30 rounded-lg p-2 transition-colors group/stat"
        >
          <div className="flex items-center justify-center mb-1">
            <MessageCircle className="w-4 h-4 text-emerald-400 group-hover/stat:text-emerald-300" />
          </div>
          <div className="text-lg font-semibold text-white group-hover/stat:text-emerald-300">{conversationCount}</div>
          <div className="text-xs text-gray-400">Chats</div>
        </button>
        <button
          onClick={() => onProjectStatsClick(project, 'documents')}
          className="text-center hover:bg-gray-800/30 rounded-lg p-2 transition-colors group/stat"
        >
          <div className="flex items-center justify-center mb-1">
            <FileText className="w-4 h-4 text-blue-400 group-hover/stat:text-blue-300" />
          </div>
          <div className="text-lg font-semibold text-white group-hover/stat:text-blue-300">{documentCount}</div>
          <div className="text-xs text-gray-400">Docs</div>
        </button>
        <button
          onClick={handleScheduleClick}
          className="text-center hover:bg-gray-800/30 rounded-lg p-2 transition-colors group/stat"
        >
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-4 h-4 text-purple-400 group-hover/stat:text-purple-300" />
          </div>
          <div className="text-lg font-semibold text-white group-hover/stat:text-purple-300">{scheduleOfWorksCount}</div>
          <div className="text-xs text-gray-400">Schedule</div>
        </button>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onStartNewChat(project.id)}
          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
        >
          Start Chat
        </button>
        <button
          onClick={() => onEdit(project)}
          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50 rounded-lg transition-all duration-200"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(project.id, project.name)}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Project dates */}
      <div className="mt-4 pt-3 border-t border-gray-800/30 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
          <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;

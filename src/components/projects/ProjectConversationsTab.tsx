import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ProjectConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
}

interface ProjectConversationsTabProps {
  project: any;
  conversations: ProjectConversation[];
  onStartNewChat: (projectId: string, conversationId?: string) => void;
  onConversationClick: (conversationId: string) => void;
}

const ProjectConversationsTab = ({
  project,
  conversations,
  onStartNewChat,
  onConversationClick
}: ProjectConversationsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Project Conversations</h3>
          <p className="text-gray-400 text-sm">AI chats and discussions for this project</p>
        </div>
        <Button
          onClick={() => onStartNewChat(project.id)}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No conversations yet</h3>
          <p className="text-sm text-gray-400 mb-6">Start your first AI chat about this project</p>
          <Button
            onClick={() => onStartNewChat(project.id)}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start First Chat
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onConversationClick(conversation.id)}
              className="p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl hover:border-emerald-500/30 hover:bg-gray-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                    {conversation.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>Last activity {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 group-hover:text-emerald-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectConversationsTab;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Project Conversations</h3>
          <p className="text-muted-foreground mt-1">AI chats and discussions for this project</p>
        </div>
        <Button
          onClick={() => onStartNewChat(project.id)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="text-center py-16 bg-card/30 backdrop-blur border border-border/30 rounded-2xl">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">No conversations yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start your first AI chat to get help with building regulations, planning applications, and project management
          </p>
          <Button
            onClick={() => onStartNewChat(project.id)}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start First Chat
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onConversationClick(conversation.id)}
              className="group cursor-pointer"
            >
              <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:bg-card/70 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
                      {conversation.title}
                    </h4>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Last activity {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
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
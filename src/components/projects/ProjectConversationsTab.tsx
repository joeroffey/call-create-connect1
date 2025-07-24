import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ProjectConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ProjectConversationsTabProps {
  project: any;
  conversations: ProjectConversation[];
  onStartNewChat: () => void;
  onConversationClick: (conversationId: string) => void;
}

const ProjectConversationsTab = ({ 
  project, 
  conversations, 
  onStartNewChat, 
  onConversationClick 
}: ProjectConversationsTabProps) => {
  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">AI Conversations</h3>
          <p className="text-muted-foreground mt-1">
            Chat with AI for building regulation guidance and project support
          </p>
        </div>
        <Button
          onClick={onStartNewChat}
          className="bg-primary hover:bg-primary/90 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations Content */}
      {conversations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-card/30 backdrop-blur border border-border rounded-2xl"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">No conversations yet</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Start your first conversation to get AI assistance with building regulations, 
            project planning, and compliance questions.
          </p>
          <Button
            onClick={onStartNewChat}
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start First Chat
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid gap-4">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onConversationClick(conversation.id)}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {conversation.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Last active {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectConversationsTab;
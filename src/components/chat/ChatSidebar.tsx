
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Plus, 
  X, 
  ChevronRight, 
  Crown,
  Clock,
  Search,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConversations } from '../../hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
  user: any;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
  projectId?: string | null;
}

const ChatSidebar = ({ 
  isOpen, 
  onClose, 
  onViewPlans, 
  user,
  onSelectConversation,
  currentConversationId,
  projectId
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { conversations, loading, refreshConversations } = useConversations(user?.id);
  const { toast } = useToast();

  // Filter conversations by project if projectId is provided
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectId ? 
      // For project chats, only show conversations linked to this project
      conversation.project_id === projectId :
      // For general chats, only show conversations not linked to any project
      !conversation.project_id;
    
    return matchesSearch && matchesProject;
  });

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      refreshConversations();
      
      // If the deleted conversation was currently selected, clear selection
      if (currentConversationId === conversationId) {
        onSelectConversation('');
      }

      toast({
        title: "Conversation Deleted",
        description: "The conversation has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-950 via-black to-gray-950 border-r border-gray-800/50 z-50 lg:relative lg:z-auto flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-emerald-400" />
                  {projectId ? 'Project Chats' : 'Chat History'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors lg:hidden"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400 text-sm"
                />
              </div>

              {/* Upgrade Banner */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-3 mb-4 cursor-pointer"
                onClick={onViewPlans}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-amber-400 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-amber-300">Upgrade to Pro</p>
                      <p className="text-xs text-amber-200">Unlimited chats & features</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </div>
              </motion.div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-2">
                    {searchQuery ? 'No conversations found' : 
                     projectId ? 'No project chats yet' : 'No conversations yet'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {projectId ? 'Start a new chat about this project' : 'Start a new conversation to get help'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
                        currentConversationId === conversation.id
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'hover:bg-gray-800/50 border border-transparent'
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate mb-1">
                            {conversation.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(conversation.updated_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all duration-200 ml-2"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;

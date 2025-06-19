
import React from 'react';
import { motion } from 'framer-motion';
import { X, Crown, MessageSquare, History } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
  user?: any;
  onSelectConversation?: (conversationId: string) => void;
  currentConversationId?: string | null;
}

const ChatSidebar = ({ 
  isOpen, 
  onClose, 
  onViewPlans, 
  user, 
  onSelectConversation,
  currentConversationId 
}: ChatSidebarProps) => {
  const { conversations, loading } = useConversations(user?.id);

  if (!isOpen) return null;

  const handleConversationClick = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Chat History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading conversations...
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentConversationId === conversation.id
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {conversation.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm py-8">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No chat history yet
            </div>
          )}
        </div>

        {/* Upgrade Section */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Pro Features</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Unlock advanced features and priority support
            </p>
            <button
              onClick={onViewPlans}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatSidebar;

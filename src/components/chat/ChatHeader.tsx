

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onNewConversation: () => void;
}

const ChatHeader = ({ onToggleSidebar, sidebarOpen, onNewConversation }: ChatHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewConversation}
          className="flex items-center px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;


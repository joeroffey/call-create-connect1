
import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onNewConversation: () => void;
  onExitProjectChat?: () => void;
  isProjectChat?: boolean;
}

const ChatHeader = ({ 
  title, 
  subtitle, 
  onToggleSidebar, 
  sidebarOpen, 
  onNewConversation,
  onExitProjectChat,
  isProjectChat = false
}: ChatHeaderProps) => {
  const handleNewChat = () => {
    if (isProjectChat && onExitProjectChat) {
      onExitProjectChat();
    } else {
      onNewConversation();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-white/5 px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
        
        <div className="flex items-center space-x-3">
          <div className="w-15 h-10 flex items-center justify-center">
            <img 
              src="/lovable-uploads/7346f91f-4a0c-4476-898f-ade068450963.png" 
              alt="EezyBuild Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleNewChat}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
      >
        {isProjectChat ? (
          <>
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Project Chat</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default ChatHeader;


import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onNewConversation: () => void;
  onExitProjectChat?: () => void;
  isProjectChat?: boolean;
  showBackButton?: boolean;
}

const ChatHeader = ({ 
  title, 
  subtitle, 
  onToggleSidebar, 
  sidebarOpen, 
  onNewConversation,
  onExitProjectChat,
  isProjectChat = false,
  showBackButton = false
}: ChatHeaderProps) => {
  const navigate = useNavigate();
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
      className={`glass border-b border-white/5 px-4 py-3 flex items-center justify-between ${isProjectChat && 'flex-wrap gap-4'}`}
    >
      <div className="flex items-center space-x-3">
        {showBackButton ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}
        
        <div className="flex items-center space-x-3">
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
        className={`flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-all duration-200 text-sm font-medium ${isProjectChat  && 'w-full md:w-auto justify-center mt-2 md:mt-0'}`}
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

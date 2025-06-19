import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const ChatHeader = ({ title, subtitle, onToggleSidebar, sidebarOpen }: ChatHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </motion.button>
        
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-300 font-medium">Online</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader;

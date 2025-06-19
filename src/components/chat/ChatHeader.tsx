
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const ChatHeader = ({ onToggleSidebar, sidebarOpen }: ChatHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;

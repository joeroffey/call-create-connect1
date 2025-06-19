
import React from 'react';
import { motion } from 'framer-motion';
import { X, Crown, MessageSquare, History } from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
}

const ChatSidebar = ({ isOpen, onClose, onViewPlans }: ChatSidebarProps) => {
  if (!isOpen) return null;

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
        <div className="flex-1 p-4 space-y-2">
          <div className="text-center text-gray-500 text-sm py-8">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No chat history yet
          </div>
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

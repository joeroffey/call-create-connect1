import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Clock, Search, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface DemoChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const DemoChatSidebar = ({ 
  isOpen, 
  onClose, 
  onViewPlans, 
  currentConversationId,
  onSelectConversation 
}: DemoChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const demoConversations = [
    {
      id: 'demo-conv-1',
      title: 'Part L Energy Efficiency Requirements',
      timestamp: '2 hours ago',
      preview: 'What are the requirements for Part L energy efficiency in new residential builds?'
    },
    {
      id: 'demo-conv-2', 
      title: 'Foundation Design Questions',
      timestamp: 'Yesterday',
      preview: 'I need guidance on foundation design for clay soil conditions...'
    },
    {
      id: 'demo-conv-3',
      title: 'Fire Safety Regulations',
      timestamp: '2 days ago',
      preview: 'Help with fire safety requirements for multi-story residential building'
    },
    {
      id: 'demo-conv-4',
      title: 'Planning Permission Process',
      timestamp: '1 week ago',
      preview: 'What documents do I need for planning permission application?'
    },
    {
      id: 'demo-conv-5',
      title: 'Structural Calculations',
      timestamp: '1 week ago',
      preview: 'Do I need structural calculations for this beam replacement?'
    }
  ];

  const filteredConversations = demoConversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute left-0 top-0 h-full w-80 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
              <h2 className="text-lg font-semibold text-white">Chat History</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 border-gray-700/50 hover:border-emerald-500/40 ${
                        currentConversationId === conversation.id 
                          ? 'bg-emerald-500/10 border-emerald-500/40' 
                          : 'bg-gray-900/40 hover:bg-gray-800/60'
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">
                              {conversation.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {conversation.preview}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {conversation.timestamp}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Upgrade Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-gray-800/50"
            >
              <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
                <CardContent className="p-4 text-center">
                  <Crown className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Unlimited History
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Access all your conversations with Pro
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                    onClick={onViewPlans}
                  >
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoChatSidebar;
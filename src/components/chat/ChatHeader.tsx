
import React from 'react';
import { Menu, MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  currentConversationId: string | null;
  onToggleSidebar: () => void;
  onNewConversation: () => void;
}

const ChatHeader = ({ currentConversationId, onToggleSidebar, onNewConversation }: ChatHeaderProps) => {
  return (
    <div className="border-b border-gray-800 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-3">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">
            {currentConversationId ? 'Building Regulations Chat' : 'New Chat'}
          </span>
        </div>
      </div>
      
      <Button
        onClick={onNewConversation}
        variant="outline"
        size="sm"
        className="border-gray-600 text-white hover:bg-gray-800"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Chat
      </Button>
    </div>
  );
};

export default ChatHeader;


import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    isWelcome?: boolean;
    images?: Array<{ url: string; title: string; source: string; }>;
    documentsAnalyzed?: number;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-700 text-emerald-400'
          }`}>
            {isUser ? (
              <User className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Message */}
        <MessageBubble message={message} />
      </div>
    </motion.div>
  );
};

export default ChatMessage;

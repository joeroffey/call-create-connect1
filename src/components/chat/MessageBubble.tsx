
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${
        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.sender === 'user' 
            ? 'bg-blue-600' 
            : 'bg-gradient-to-br from-purple-500 to-blue-600'
        }`}>
          {message.sender === 'user' ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 ${
          message.sender === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white border border-gray-700'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <p className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;

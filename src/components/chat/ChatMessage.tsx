
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

interface ChatMessageData {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isWelcome?: boolean;
  images?: Array<{ url: string; title: string; source: string; }>;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-emerald-500' : 'bg-gray-700'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message */}
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-emerald-500 text-white' 
            : 'bg-gray-800/50 text-white border border-white/10'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.text}
          </div>
          
          {message.images && message.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {message.images.map((image, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-2">
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-gray-300 mt-1">{image.title}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

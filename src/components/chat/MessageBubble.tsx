
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Image, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageModal from './ImageModal';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
  images?: Array<{
    url: string;
    title: string;
    source: string;
  }>;
}

interface MessageBubbleProps {
  message: Message;
  isProjectChat?: boolean;
}

const MessageBubble = ({ message, isProjectChat = false }: MessageBubbleProps) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] 
        }}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
      >
        <div className={`flex items-start space-x-3 max-w-[85%] ${
          message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm ${
            message.sender === 'user' 
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
              : 'bg-gray-800 border border-gray-700'
          }`}>
            {message.sender === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : isProjectChat ? (
              <Clock className="w-4 h-4 text-white" />
            ) : (
              <img 
                src="/lovable-uploads/9fe22cc5-2c91-4dbf-95e3-aefc00d511c7.png" 
                alt="EezyBuild Bot" 
                className="w-5 h-3 object-contain"
              />
            )}
          </div>

          {/* Message bubble */}
          <div className="flex flex-col">
            <div className={`rounded-2xl px-4 py-3 backdrop-blur-sm ${
              message.sender === 'user'
                ? 'message-bubble-user text-white shadow-lg'
                : 'message-bubble text-gray-100 border-gray-700/50'
            }`}>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-inter">{message.text}</p>
              <p className="text-xs opacity-60 mt-2 font-inter">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Images button for bot messages */}
            {message.sender === 'bot' && message.images && message.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.2,
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="mt-3"
              >
                <Button
                  onClick={() => setShowImageModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10 bg-gray-900/50 backdrop-blur-sm font-inter text-xs h-8 btn-hover transition-all duration-200 hover:border-emerald-400/40 hover:shadow-sm"
                >
                  <Image className="w-3.5 h-3.5 mr-2" />
                  View Related Images ({message.images.length})
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      {message.images && (
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={message.images}
        />
      )}
    </>
  );
};

export default MessageBubble;

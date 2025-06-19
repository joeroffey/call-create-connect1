
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Image } from 'lucide-react';
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
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
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
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
            message.sender === 'user' 
              ? 'bg-blue-600' 
              : 'bg-gradient-to-br from-emerald-500 to-green-600'
          }`}>
            {message.sender === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <img 
                src="/lovable-uploads/9fe22cc5-2c91-4dbf-95e3-aefc00d511c7.png" 
                alt="EezyBuild Bot" 
                className="w-6 h-4 object-contain"
              />
            )}
          </div>

          {/* Message bubble */}
          <div className="flex flex-col">
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

            {/* Images button for bot messages */}
            {message.sender === 'bot' && message.images && message.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2"
              >
                <Button
                  onClick={() => setShowImageModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 bg-gray-800/50"
                >
                  <Image className="w-4 h-4 mr-2" />
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

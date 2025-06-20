
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, Lightbulb, Book, Milestone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import MessageBubble from './chat/MessageBubble';
import TypingIndicator from './chat/TypingIndicator';
import ImageGallery from './chat/ImageGallery';

interface ChatInterfaceProps {
  user: any;
  onViewPlans: () => void;
}

const ChatInterface = ({ user, onViewPlans }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relatedImages, setRelatedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Simulate sending a message and receiving a response
    setTimeout(() => {
      setIsLoading(false);
      setMessage('');
      scrollToBottom();
    }, 1500);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setRelatedImages(newImages);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm">
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Advice
          </Button>
          <Button variant="secondary" size="sm">
            <Book className="w-4 h-4 mr-2" />
            Building Codes
          </Button>
          <Button variant="secondary" size="sm">
            <Milestone className="w-4 h-4 mr-2" />
            Project Plan
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageBubble
          message={{
            id: '1',
            text: 'Hello! How can I help you with your building project today?',
            sender: 'bot',
            timestamp: new Date()
          }}
        />
        <MessageBubble
          message={{
            id: '2',
            text: 'I need some advice on choosing the right materials for a foundation in a wet climate.',
            sender: 'user',
            timestamp: new Date()
          }}
        />
        <MessageBubble
          message={{
            id: '3',
            text: 'For wet climates, consider using concrete with a high cement content and proper waterproofing membranes.',
            sender: 'bot',
            timestamp: new Date()
          }}
        />
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />

        {/* Image Gallery */}
        {relatedImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-4"
          >
            <ImageGallery images={relatedImages} />
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about building regulations..."
              className="min-h-[44px] resize-none bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
            </button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatInterface;

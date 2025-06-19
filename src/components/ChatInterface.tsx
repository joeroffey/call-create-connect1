
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Lightbulb, Book } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatSidebar from './chat/ChatSidebar';
import ImageGallery from './chat/ImageGallery';
import { useToast } from "@/components/ui/use-toast"

interface ChatMessageData {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isWelcome?: boolean;
  images?: Array<{ url: string; title: string; source: string; }>;
}

interface ChatInterfaceProps {
  user: any;
  onViewPlans: () => void;
}

// Simple ID generator to replace uuid
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const ChatInterface = ({ user, onViewPlans }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [relatedImages, setRelatedImages] = useState<Array<{ url: string; title: string; source: string; }>>([]);
  const { toast } = useToast()

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Focus on input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Add welcome message on initial load
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  const welcomeMessage = {
    id: 'welcome',
    text: `Welcome to EezyBuild! 👋

I'm your UK Building Regulations specialist, here to help you navigate construction requirements, planning permissions, and building standards.

**What I can help with:**
• Building Regulations compliance (Parts A-P)
• Planning permission requirements
• Fire safety regulations
• Accessibility standards
• Energy efficiency requirements
• Structural requirements
• And much more!

Feel free to ask me anything about UK Building Regulations. I'm here to make compliance simple and straightforward.`,
    sender: 'assistant' as const,
    timestamp: new Date(),
    isWelcome: true
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage: ChatMessageData = {
      id: generateId(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');

    setIsLoading(true);
    try {
      const response = await fetch('/api/building-regulations-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessageData = {
        id: generateId(),
        text: data.response,
        sender: 'assistant',
        timestamp: new Date(),
        images: data.images
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setRelatedImages(data.images || []);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with the server. Please try again later.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Header */}
      <ChatHeader 
        title="UK Building Regulations Chat"
        subtitle="Get expert guidance on building standards and compliance"
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarOpen={isSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex min-h-0">
        <ChatSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onViewPlans={onViewPlans} />

        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'loading',
                  text: 'Thinking...',
                  sender: 'assistant',
                  timestamp: new Date(),
                }}
              />
            )}
          </div>

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

          {/* Input Area */}
          <div className="glass border-t border-white/5 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask a question about UK Building Regulations..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-0 transition-colors resize-none"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2.5 px-5 rounded-xl focus:outline-none focus:ring-0 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : <Send className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

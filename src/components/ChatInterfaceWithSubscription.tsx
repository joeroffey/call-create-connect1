
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Menu, X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import ChatSidebar from './chat/ChatSidebar';
import MessageBubble from './chat/MessageBubble';
import TypingIndicator from './chat/TypingIndicator';
import ImageGallery from './chat/ImageGallery';
import { useConversationMessages } from '../hooks/useConversationMessages';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '../hooks/useSubscription';

interface ChatInterfaceWithSubscriptionProps {
  user: any;
  onViewPlans: () => void;
  projectId?: string | null;
  onChatComplete?: () => void;
  onStartGeneralChat?: () => void;
}

const ChatInterfaceWithSubscription = ({ 
  user, 
  onViewPlans, 
  projectId,
  onChatComplete,
  onStartGeneralChat
}: ChatInterfaceWithSubscriptionProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { hasActiveSubscription } = useSubscription(user?.id);

  const { messages, loading: messagesLoading, sendMessage, refreshMessages } = useConversationMessages(
    currentConversationId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear conversation when project context changes
  useEffect(() => {
    console.log('Project context changed:', projectId);
    if (projectId !== undefined) {
      setCurrentConversationId(null);
    }
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!message.trim() && uploadedImages.length === 0) return;
    if (!hasActiveSubscription) {
      onViewPlans();
      return;
    }

    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            project_id: projectId // This will be null for general chats
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = conversation.id;
        setCurrentConversationId(conversationId);
      }

      // Send the message
      await sendMessage(message, uploadedImages);
      
      setMessage('');
      setUploadedImages([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    console.log('Starting new chat - project context:', projectId);
    setCurrentConversationId(null);
    setMessage('');
    setUploadedImages([]);
    
    // If we're in project mode, don't call onStartGeneralChat
    // If we want to start a general chat from project mode, we need to explicitly call it
    if (!projectId && onStartGeneralChat) {
      onStartGeneralChat();
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex relative bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onViewPlans={onViewPlans}
        user={user}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
        projectId={projectId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {projectId ? 'Project Chat' : 'AI Assistant'}
              </h2>
              <p className="text-sm text-gray-400">
                {projectId ? 'Chat about your project' : 'Get help with building regulations and construction'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* New General Chat Button - only show when in project mode */}
            {projectId && onStartGeneralChat && (
              <button
                onClick={() => {
                  onStartGeneralChat();
                  handleNewChat();
                }}
                className="flex items-center px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-sm text-gray-300"
              >
                <Plus className="w-4 h-4 mr-1" />
                General Chat
              </button>
            )}
            <button
              onClick={handleNewChat}
              className="flex items-center px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg transition-colors text-sm text-emerald-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              {projectId ? 'New Project Chat' : 'New Chat'}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-gray-400">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {projectId ? 'Start Your Project Discussion' : 'Start a New Conversation'}
              </h3>
              <p className="text-gray-400 max-w-md">
                {projectId 
                  ? 'Ask questions about your project, get advice on construction methods, or discuss building regulations.'
                  : 'Ask me anything about building regulations, construction techniques, or get help with your building projects.'
                }
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={{
                  id: msg.id,
                  text: msg.content,
                  sender: msg.role === 'user' ? 'user' : 'bot',
                  timestamp: new Date(msg.created_at)
                }} 
              />
            ))
          )}
          
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Gallery */}
        {uploadedImages.length > 0 && (
          <div className="px-4 pb-2">
            <ImageGallery images={uploadedImages} onRemove={removeImage} />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800/50 bg-black/20 backdrop-blur-sm">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  projectId 
                    ? "Ask about your project..." 
                    : hasActiveSubscription 
                      ? "Ask me anything about building regulations..." 
                      : "Upgrade to start chatting..."
                }
                className="min-h-[44px] max-h-32 resize-none bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!hasActiveSubscription}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                disabled={!hasActiveSubscription}
              >
                <Image className="w-5 h-5 text-gray-400" />
              </button>
              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && uploadedImages.length === 0) || isLoading || !hasActiveSubscription}
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
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterfaceWithSubscription;

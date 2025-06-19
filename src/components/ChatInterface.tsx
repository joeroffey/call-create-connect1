import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Plus, Bot, User, Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import ConversationSidebar from './ConversationSidebar';
import SubscriptionPrompt from './SubscriptionPrompt';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  user: any;
  onViewPlans: () => void;
}

const ChatInterface = ({ user, onViewPlans }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { subscription, loading: subscriptionLoading, hasActiveSubscription, refetch: refetchSubscription, createDemoSubscription } = useSubscription(user?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    }
  };

  const createNewConversation = async (firstMessage: string): Promise<string | null> => {
    try {
      const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: title || 'New Conversation'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveMessage = async (conversationId: string, content: string, role: 'user' | 'assistant') => {
    try {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !hasActiveSubscription) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsTyping(true);
    setSidebarVisible(false);

    try {
      // Create new conversation if none exists
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createNewConversation(messageText);
        if (conversationId) {
          setCurrentConversationId(conversationId);
        }
      }

      // Save user message
      if (conversationId) {
        await saveMessage(conversationId, messageText, 'user');
      }

      console.log('Sending message to building regulations AI:', messageText);
      
      const { data, error } = await supabase.functions.invoke('building-regulations-chat', {
        body: { message: messageText }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I apologise, but I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message
      if (conversationId) {
        await saveMessage(conversationId, botMessage.text, 'assistant');
      }
    } catch (error) {
      console.error('Error calling building regulations AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologise, but I'm having trouble connecting to the Building Regulations database at the moment. Please try again shortly.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your UK Building Regulations AI assistant. I can help you with questions about UK Building Regulations, planning permissions, and construction requirements. All my responses are based on the latest official UK Building Regulations documents.",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setSidebarVisible(false);
  };

  const handleCreateDemo = async () => {
    setDemoLoading(true);
    const success = await createDemoSubscription();
    if (success) {
      await refetchSubscription();
      handleNewConversation();
    }
    setDemoLoading(false);
  };

  // Show loading state
  if (subscriptionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show subscription prompt if no active subscription
  if (!hasActiveSubscription) {
    return (
      <SubscriptionPrompt
        onCreateDemo={handleCreateDemo}
        onViewPlans={onViewPlans}
        loading={demoLoading}
      />
    );
  }

  // Initialize with welcome message if no current conversation
  if (messages.length === 0 && !currentConversationId) {
    handleNewConversation();
  }

  return (
    <div className="flex-1 flex bg-black relative h-full">
      {/* Conversation Sidebar */}
      <AnimatePresence>
        {sidebarVisible && (
          <ConversationSidebar
            user={user}
            currentConversationId={currentConversationId}
            onConversationSelect={loadConversation}
            onNewConversation={handleNewConversation}
            isVisible={sidebarVisible}
            onToggle={() => setSidebarVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="border-b border-gray-800 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setSidebarVisible(true)}
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
            onClick={handleNewConversation}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat messages - takes up remaining space */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
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
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-t border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about UK Building Regulations..."
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 resize-none pr-12 min-h-[44px] max-h-32"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-full"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarVisible(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;

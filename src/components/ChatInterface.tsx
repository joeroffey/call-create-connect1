import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import ConversationSidebar from './ConversationSidebar';
import SubscriptionPrompt from './SubscriptionPrompt';
import ChatHeader from './chat/ChatHeader';
import MessageBubble from './chat/MessageBubble';
import ChatInput from './chat/ChatInput';
import TypingIndicator from './chat/TypingIndicator';

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
    <div className="h-full flex bg-black relative">
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
        <ChatHeader
          currentConversationId={currentConversationId}
          onToggleSidebar={() => setSidebarVisible(true)}
          onNewConversation={handleNewConversation}
        />

        {/* Chat messages container - fills remaining space */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages area - scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - always at bottom */}
        <ChatInput
          inputText={inputText}
          isTyping={isTyping}
          onInputChange={setInputText}
          onSend={handleSend}
          onKeyPress={handleKeyPress}
        />
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

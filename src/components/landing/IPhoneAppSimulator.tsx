import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, User, Crown, Wrench, Briefcase, Send, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import DemoAppsScreen from "@/components/demo/DemoAppsScreen";
import DemoWorkspaceScreen from "@/components/demo/DemoWorkspaceScreen";
import ProfileScreen from "@/components/ProfileScreen";
import SubscriptionScreen from "@/components/SubscriptionScreen";
import DemoChatSidebar from "@/components/demo/DemoChatSidebar";

// Demo user with subscription
const demoUser = {
  id: "demo-user-123",
  email: "demo@eezybuild.com", 
  name: "Demo User",
  subscription: "pro",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
};

const IPhoneAppSimulator = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isAuthenticated] = useState(true);

  // Available tabs with Pro subscription
  const tabs = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
    { id: 'workspace', icon: Briefcase, label: 'Workspace' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'subscription', icon: Crown, label: 'Tiers' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <DemoChatInterface 
              user={demoUser} 
              onViewPlans={() => setActiveTab('subscription')}
            />
          </div>
        );
      case 'tools':
        return (
          <DemoAppsScreen 
            user={demoUser} 
            subscriptionTier="pro"
            onViewPlans={() => setActiveTab('subscription')}
          />
        );
      case 'workspace':
        return (
          <DemoWorkspaceScreen 
            user={demoUser}
            subscriptionTier="pro"
            onViewPlans={() => setActiveTab('subscription')}
            onStartNewChat={() => setActiveTab('chat')}
          />
        );
      case 'profile':
        return (
          <div className="h-full overflow-y-auto">
            <ProfileScreen
              user={demoUser}
              onNavigateToSettings={() => setActiveTab('subscription')}
              onNavigateToAccountSettings={() => {}}
            />
          </div>
        );
      case 'subscription':
        return (
          <div className="h-full overflow-y-auto">
            <SubscriptionScreen 
              user={demoUser} 
              onBack={() => setActiveTab('profile')} 
            />
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col">
            <DemoChatInterface 
              user={demoUser} 
              onViewPlans={() => setActiveTab('subscription')}
            />
          </div>
        );
    }
  };

  // Demo Chat Interface Component
  const DemoChatInterface = ({ user, onViewPlans }: { user: any, onViewPlans: () => void }) => {
    const [messages, setMessages] = useState<Array<{
      id: string;
      text: string;
      sender: 'user' | 'assistant';
      timestamp: Date;
    }>>([
      {
        id: 'welcome',
        text: `Hi ${user.name}! 👋 Welcome to EezyBuild!\n\nI'm your UK Building Regulations specialist. I can help with:\n\n• Building Regulations compliance\n• Planning permission requirements\n• Fire safety regulations\n• Energy efficiency standards\n• And much more!\n\nTry asking me something like "What are Part L requirements?"`,
        sender: 'assistant',
        timestamp: new Date(),
      }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = () => {
      if (!newMessage.trim()) return;
      
      const userMessage = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user' as const,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsLoading(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: `Thank you for your question about "${newMessage}". This is a demo response showing how EezyBuild would provide detailed guidance on UK Building Regulations.\n\nIn the full app, I would give you:\n• Specific regulatory requirements\n• Step-by-step compliance guidance\n• Relevant document references\n• Best practice recommendations\n\nUpgrade to access the full AI assistant!`,
          sender: 'assistant' as const,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    };

    return (
      <>
        <DemoChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onViewPlans={onViewPlans}
          currentConversationId={null}
          onSelectConversation={() => {}}
        />
        
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-muted-foreground"
            >
              ☰
            </Button>
            <span className="text-sm font-medium">AI Assistant</span>
            <div className="w-8" />
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 mb-16">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur border-t border-border">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about building regulations..."
                className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none text-sm"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="relative max-w-xs mx-auto scale-[0.65] md:scale-75 lg:scale-[0.85]">
      {/* iPhone 14 Pro Frame */}
      <div className="relative">
        {/* Outer frame with metallic finish */}
        <div className="bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400 rounded-[3rem] p-1 shadow-2xl">
          {/* Inner frame */}
          <div className="bg-black rounded-[2.8rem] p-2 relative">
            {/* Dynamic Island - Fixed positioning within the phone frame */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-full z-[60] border border-gray-800"></div>
            
            {/* Phone Screen Container with smaller dimensions for better viewport fit */}
            <div className="bg-background rounded-[2.3rem] overflow-hidden h-[600px] w-[300px] relative flex flex-col">
              {/* Status Bar */}
              <div className="flex justify-between items-center px-6 py-2 text-xs text-muted-foreground bg-background pt-8 flex-shrink-0 relative z-50">
                <span className="font-semibold">9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-foreground rounded-full"></div>
                    <div className="w-1 h-1 bg-foreground rounded-full"></div>
                    <div className="w-1 h-1 bg-foreground rounded-full"></div>
                    <div className="w-1 h-1 bg-foreground/50 rounded-full"></div>
                  </div>
                  <div className="w-5 h-2.5 border border-foreground rounded-sm relative">
                    <div className="w-3.5 h-1.5 bg-green-500 rounded-sm absolute top-0.5 left-0.5"></div>
                    <div className="w-0.5 h-1 bg-foreground rounded-r absolute -right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>

              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#000000] backdrop-blur flex-shrink-0 relative z-50">
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-12 flex items-center">
                    <img 
                      src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png" 
                      alt="EezyBuild Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/20">
                  <Crown className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Pro</span>
                </div>
              </div>

              {/* Main Content Container with proper positioning */}
              <div className="flex-1 overflow-hidden min-h-0 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full min-h-full"
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              <div className="flex justify-around py-2 border-t border-border bg-background/95 backdrop-blur flex-shrink-0 relative z-50">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center p-2 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
      </div>

      {/* Demo Labels */}
      <div className="absolute -bottom-12 left-0 right-0 text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-muted-foreground">Interactive Demo</p>
        </motion.div>
        <p className="text-xs text-muted-foreground/70">
          Try the chat, tools, and features!
        </p>
      </div>
    </div>
  );
};

export default IPhoneAppSimulator;
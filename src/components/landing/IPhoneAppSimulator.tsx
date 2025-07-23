import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, User, Crown, Wrench, Briefcase, Send, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import AppsScreen from "@/components/AppsScreen";
import WorkspaceScreen from "@/components/WorkspaceScreen";
import ProfileScreen from "@/components/ProfileScreen";
import SubscriptionScreen from "@/components/SubscriptionScreen";

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
          <div className="h-full">
            <ChatInterface 
              user={demoUser} 
              onViewPlans={() => setActiveTab('subscription')}
            />
          </div>
        );
      case 'tools':
        return (
          <div className="h-full">
            <AppsScreen 
              user={demoUser} 
              subscriptionTier="pro"
              onViewPlans={() => setActiveTab('subscription')}
            />
          </div>
        );
      case 'workspace':
        return (
          <div className="h-full">
            <WorkspaceScreen 
              user={demoUser}
              subscriptionTier="pro"
              onViewPlans={() => setActiveTab('subscription')}
              onStartNewChat={(projectId) => setActiveTab('chat')}
              pendingProjectModal={null}
              onProjectModalHandled={() => {}}
            />
          </div>
        );
      case 'profile':
        return (
          <div className="h-full">
            <ProfileScreen
              user={demoUser}
              onNavigateToSettings={() => setActiveTab('subscription')}
              onNavigateToAccountSettings={() => {}}
            />
          </div>
        );
      case 'subscription':
        return (
          <div className="h-full">
            <SubscriptionScreen 
              user={demoUser} 
              onBack={() => setActiveTab('profile')} 
            />
          </div>
        );
      default:
        return (
          <div className="h-full">
            <ChatInterface 
              user={demoUser} 
              onViewPlans={() => setActiveTab('subscription')}
            />
          </div>
        );
    }
  };

  return (
    <div className="relative max-w-sm mx-auto">
      {/* iPhone 14 Pro Frame */}
      <div className="relative">
        {/* Outer frame with metallic finish */}
        <div className="bg-gradient-to-b from-gray-300 via-gray-200 to-gray-400 rounded-[3rem] p-1 shadow-2xl">
          {/* Inner frame */}
          <div className="bg-black rounded-[2.8rem] p-2">
            {/* Dynamic Island */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-full z-50 border border-gray-800"></div>
            
            {/* Phone Screen */}
            <div className="bg-background rounded-[2.3rem] overflow-hidden h-[700px] w-[350px] relative flex flex-col">
              {/* Status Bar */}
              <div className="flex justify-between items-center px-6 py-2 text-xs text-muted-foreground bg-background pt-8 flex-shrink-0">
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
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-primary-foreground font-bold text-sm">E</span>
                  </div>
                  <span className="font-bold text-sm text-foreground">EEZYBUILD</span>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">Pro</span>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
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
              <div className="flex justify-around py-2 border-t border-border bg-background/95 backdrop-blur flex-shrink-0">
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
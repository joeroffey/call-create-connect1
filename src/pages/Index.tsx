
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, User, Settings, Crown, Building2 } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import ProfileScreen from '../components/ProfileScreen';
import SubscriptionScreen from '../components/SubscriptionScreen';
import AccountSettingsScreen from '../components/AccountSettingsScreen';
import AuthScreen from '../components/AuthScreen';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            subscription: 'pro',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          subscription: 'pro',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const tabs = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuth={setIsAuthenticated} setUser={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface user={user} onViewPlans={() => setActiveTab('settings')} />;
      case 'search':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Advanced Search</h2>
              <p className="text-gray-400">Coming soon - Search through Building Regulations</p>
            </motion.div>
          </div>
        );
      case 'profile':
        return (
          <ProfileScreen 
            user={user} 
            onNavigateToSettings={() => setActiveTab('subscription')}
            onNavigateToAccountSettings={() => setActiveTab('account-settings')}
          />
        );
      case 'settings':
      case 'subscription':
        return <SubscriptionScreen user={user} onBack={() => setActiveTab('profile')} />;
      case 'account-settings':
        return <AccountSettingsScreen user={user} onBack={() => setActiveTab('profile')} />;
      default:
        return <ChatInterface user={user} onViewPlans={() => setActiveTab('settings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="safe-area-top bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Eezybuild
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-yellow-500 font-medium">Pro</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="safe-area-bottom bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 px-4 py-2"
      >
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
};

export default Index;

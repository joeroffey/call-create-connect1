import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, User, Settings, Crown } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import ProfileScreen from '../components/ProfileScreen';
import SubscriptionScreen from '../components/SubscriptionScreen';
import AccountSettingsScreen from '../components/AccountSettingsScreen';
import AuthScreen from '../components/AuthScreen';
import AdvancedSearchInterface from '../components/AdvancedSearchInterface';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
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
        return <AdvancedSearchInterface user={user} />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="safe-area-top bg-black/60 backdrop-blur-xl border-b border-emerald-500/20 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-14 h-10 rounded-xl overflow-hidden bg-emerald-500/10 flex items-center justify-center p-1">
              <img 
                src="/lovable-uploads/73ddab81-0c66-4a56-8ab4-99cff6d608a5.png" 
                alt="EezyBuild Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
              EezyBuild
            </h1>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-4 py-2 rounded-full border border-emerald-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Crown className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-semibold">Pro</span>
          </motion.div>
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
            transition={{ duration: 0.4, ease: "easeInOut" }}
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
        transition={{ duration: 0.6, delay: 0.2 }}
        className="safe-area-bottom bg-black/60 backdrop-blur-xl border-t border-emerald-500/20 px-4 py-3"
      >
        <div className="flex justify-around max-w-md mx-auto">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-b from-emerald-500/30 to-green-600/20 text-emerald-300 shadow-lg shadow-emerald-500/20' 
                    : 'text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <Icon className={`w-6 h-6 transition-all duration-300 ${
                  isActive ? 'text-emerald-300 drop-shadow-lg' : ''
                }`} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
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

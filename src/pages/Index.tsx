import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, User, Bell, Crown, Wrench, FolderOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatInterfaceWithSubscription from '../components/ChatInterfaceWithSubscription';
import ProfileScreen from '../components/ProfileScreen';
import SubscriptionScreen from '../components/SubscriptionScreen';
import AccountSettingsScreen from '../components/AccountSettingsScreen';
import AuthScreen from '../components/AuthScreen';
import AdvancedSearchInterface from '../components/AdvancedSearchInterface';
import AppsScreen from '../components/AppsScreen';
import ProjectsScreen from '../components/ProjectsScreen';
import OnboardingScreen from '../components/OnboardingScreen';
import NotificationsScreen from '../components/NotificationsScreen';
import TeamScreen from '../components/TeamScreen';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useSubscription } from '../hooks/useSubscription';
import { useDeepLinking } from '@/hooks/useDeepLinking';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [pendingProjectModal, setPendingProjectModal] = useState<{projectId: string, view: string} | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Get subscription info
  const { subscription, hasActiveSubscription, refetch } = useSubscription(user?.id);

  // Set up deep linking for mobile app
  useDeepLinking();

  // Handle URL parameters for project navigation from notifications
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const projectId = urlParams.get('project');
    const view = urlParams.get('view');
    
    console.log('🔍 URL params check:', { tab, projectId, view, fullUrl: window.location.href });
    
    if (tab && projectId && view === 'schedule') {
      console.log('🎯 Notification navigation detected:', { tab, projectId, view });
      console.log('👤 User subscription tier:', hasActiveSubscription ? subscription?.plan_type : 'none');
      
      setActiveTab(tab);
      setPendingProjectModal({ projectId, view });
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      console.log('✅ URL cleaned and state set');
    }
  }, [hasActiveSubscription, subscription]);

  useEffect(() => {
    // Check for successful subscription in URL and handle it
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const sessionId = urlParams.get('session_id');
      console.log('🎉 Checkout success detected:', { sessionId });

      // Clean up URL immediately to prevent overlay issues
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // More aggressive refresh strategy for post-checkout
      const aggressiveRefresh = async () => {
        if (user?.id) {
          console.log('🔄 Starting aggressive subscription refresh after successful checkout');

          // Immediate refresh
          await refetch();

          // Staggered retries with increasing delays
          const delays = [3000, 8000, 15000, 30000, 60000]; // 3s, 8s, 15s, 30s, 60s

          for (let i = 0; i < delays.length; i++) {
            setTimeout(async () => {
              console.log(`🔄 Subscription refresh attempt ${i + 2}`);
              await refetch();
            }, delays[i]);
          }
        }
      };

      // Start the aggressive refresh process
      setTimeout(aggressiveRefresh, 1000);

      // Switch to subscription tab to show the updated status
      setActiveTab('subscription');
    }
  }, [user?.id, refetch]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            subscription: 'pro',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          };
          setUser(userData);
          setIsAuthenticated(true);

          // Check if user needs onboarding (in real app, check from database)
          const hasCompletedOnboarding = session.user.user_metadata?.onboarding_completed;
          setNeedsOnboarding(!hasCompletedOnboarding);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setNeedsOnboarding(false);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          subscription: 'pro',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        };
        setUser(userData);
        setIsAuthenticated(true);

        // Check if user needs onboarding
        const hasCompletedOnboarding = session.user.user_metadata?.onboarding_completed;
        setNeedsOnboarding(!hasCompletedOnboarding);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = async (userData: any) => {
    // Update user metadata to mark onboarding as completed
    try {
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          full_name: userData.fullName,
          address: userData.address,
          occupation: userData.occupation,
          date_of_birth: userData.dateOfBirth
        }
      });

      setUser(userData);
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Error updating user metadata:', error);
    }
  };

  // Get user's subscription tier
  const getSubscriptionTier = () => {
    if (!hasActiveSubscription || !subscription) return 'none';
    return subscription.plan_type;
  };

  const subscriptionTier = getSubscriptionTier();

  // Get display name for subscription tier
  const getSubscriptionDisplayName = () => {
    if (!hasActiveSubscription || !subscription) return 'No Plan';

    switch (subscription.plan_type) {
      case 'basic':
        return 'EezyBuild';
      case 'pro':
        return 'Pro';
      case 'enterprise':
        return 'ProMax';
      default:
        return 'No Plan';
    }
  };

  // Define available tabs based on subscription - replaced Updates with Team
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'chat', icon: MessageCircle, label: 'Chat' },
    ];

    // Tools available for EezyBuild (basic), Pro and ProMax
    if (hasActiveSubscription && subscription && (subscription.plan_type === 'basic' || subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise')) {
      baseTabs.push({ id: 'apps', icon: Wrench, label: 'Tools' });
    }

    // Advanced Search only for ProMax
    if (hasActiveSubscription && subscription && subscription.plan_type === 'enterprise') {
      baseTabs.push({ id: 'search', icon: Search, label: 'Search' });
      baseTabs.push({ id: 'projects', icon: FolderOpen, label: 'Projects' });
    }

    // Team tab available for all subscription levels (will show upgrade prompt if needed)
    baseTabs.push({ id: 'team', icon: Users, label: 'Team' });

    // Always available tabs
    baseTabs.push(
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'subscription', icon: Crown, label: 'Plans' }
    );

    return baseTabs;
  };

  const tabs = getAvailableTabs();

  // Reset active tab if it's not available in current subscription
  useEffect(() => {
    const availableTabIds = tabs.map(tab => tab.id);
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab('chat');
    }
  }, [subscriptionTier, activeTab]);

  // Scroll to top when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  const handleStartNewChat = (projectId: string, conversationId?: string) => {
    console.log('Starting new chat for project:', projectId, 'conversation:', conversationId);
    setCurrentProjectId(projectId);
    setCurrentConversationId(conversationId || null);
    setActiveTab('chat');
  };

  const handleChatComplete = () => {
    // Reset project context when chat is done or user navigates away
    setCurrentProjectId(null);
    setCurrentConversationId(null);
  };

  // Navigation handler for viewing subscription plans - ENHANCED DEBUGGING
  const handleViewPlans = () => {
    console.log('🚀 handleViewPlans called - setting activeTab to subscription');
    console.log('🔄 Current activeTab:', activeTab);
    setActiveTab('subscription');
    console.log('✅ activeTab should now be: subscription');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuth={(authenticated) => {
          setIsAuthenticated(authenticated);
        }}
        setUser={setUser}
      />
    );
  }

  if (needsOnboarding) {
    return <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    console.log('🖥️ Rendering content for activeTab:', activeTab);

    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterfaceWithSubscription
            user={user}
            onViewPlans={handleViewPlans}
            projectId={currentProjectId}
            conversationId={currentConversationId}
            onChatComplete={handleChatComplete}
          />
        );
      case 'search':
        if (subscriptionTier !== 'enterprise') {
          return <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">ProMax Required</h2>
              <p className="text-gray-400 mb-6">Advanced Search is only available for EezyBuild ProMax subscribers.</p>
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Upgrade to ProMax
              </button>
            </div>
          </div>;
        }
        return <AdvancedSearchInterface user={user} />;
      case 'apps':
        if (subscriptionTier === 'none') {
          return <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Subscription Required</h2>
              <p className="text-gray-400 mb-6">Building Tools are available for EezyBuild, Pro and ProMax subscribers.</p>
              <button
                onClick={handleViewPlans}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Choose a Plan
              </button>
            </div>
          </div>;
        }
        return <AppsScreen user={user} subscriptionTier={subscriptionTier} onViewPlans={handleViewPlans} />;
      case 'projects':
        if (subscriptionTier !== 'enterprise') {
          return <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">ProMax Required</h2>
              <p className="text-gray-400 mb-6">Projects feature is only available for EezyBuild ProMax subscribers.</p>
              <button
                onClick={handleViewPlans}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Upgrade to ProMax
              </button>
            </div>
          </div>;
        }
        return <ProjectsScreen 
          user={user} 
          onStartNewChat={handleStartNewChat} 
          pendingProjectModal={pendingProjectModal}
          onProjectModalHandled={() => setPendingProjectModal(null)}
        />;
      case 'team':
        return <TeamScreen user={user} subscriptionTier={subscriptionTier} onViewPlans={handleViewPlans} onStartNewChat={handleStartNewChat} />;
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onNavigateToSettings={handleViewPlans}
            onNavigateToAccountSettings={() => setActiveTab('account-settings')}
          />
        );
      case 'subscription':
        console.log('🎯 Rendering SubscriptionScreen component');
        return <SubscriptionScreen user={user} onBack={() => setActiveTab('profile')} />;
      case 'account-settings':
        return <AccountSettingsScreen user={user} onBack={() => setActiveTab('profile')} />;
      default:
        console.log('🔄 Default case - rendering ChatInterfaceWithSubscription');
        return <ChatInterfaceWithSubscription user={user} onViewPlans={handleViewPlans} />;
    }
  };

  return (
    <div className="h-screen h-dvh bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white flex flex-col overflow-hidden font-inter fixed w-full top-0 left-0">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass border-b border-white/5 px-6 flex-shrink-0 safe-area-top"
      >
        <div className="flex items-center justify-between ">
          <motion.div
            className="flex items-center"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="w-40 h-24 flex items-center z-50">
              <div>
                <img
                  src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png"
                  alt="EezyBuild Logo"
                  className="w-full h-full object-contain"
                />
                <div className="ml-4 z-50">
                  {currentProjectId && (
                    <p className="text-sm mt-1 text-emerald-400">Project Chat Mode</p>
                  )}
                </div>
              </div>
            </div>
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              style={{ marginLeft: 'auto', marginRight: 'auto', zIndex: '1' }}
              className="hidden md:flex absolute border-b w-full border-white/5 px-6 py-3 backdrop-blur-md z-10"
            >
              <div className="flex w-full max-w-6xl mx-auto justify-center space-x-4">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        : 'text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/5'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.nav>


          </motion.div>

          <div className="flex items-center space-x-4 z-50">
            {/* Notifications Bell Icon */}
            <motion.button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {/* Notification badge - you can add logic to show unread count */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </motion.button>

            {/* Subscription Badge */}
            <motion.div
              className="flex items-center space-x-3 bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Crown className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">
                {getSubscriptionDisplayName()}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.header>


      {/* Main Content - fills space between header and nav with proper mobile spacing */}
      <main className="flex-1 min-h-0 overflow-y-auto pb-24">
        <div className="w-full max-w-6xl mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              ref={mainContentRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full overflow-y-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation - Fixed and responsive with proper centering */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-4 py-3 safe-area-bottom md:hidden"
      >
        <div className="flex justify-center items-center w-full">
          <div className="flex w-full max-w-md mx-auto justify-center">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 flex-1 min-w-0 ${isActive
                    ? 'bg-emerald-500/15 text-emerald-300 backdrop-blur-sm border border-emerald-500/20'
                    : 'text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/5'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-emerald-300' : ''
                    }`} />
                  <span className="text-xs mt-1 font-medium truncate">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-2 h-2 bg-emerald-400 rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default Index;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, User, Bell, Crown, Wrench, FolderOpen } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get subscription info
  const { subscription, hasActiveSubscription, refetch } = useSubscription(user?.id);

  useEffect(() => {
    // Check for return from customer portal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('portal_return') === 'true') {
      console.log('🔙 Returned from customer portal');
      
      // Clean up URL immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Refresh subscription status
      if (user?.id) {
        refetch();
      }
      
      toast({
        title: "Welcome back!",
        description: "Your subscription has been updated.",
        duration: 3000,
      });
    }

    // Check for successful subscription in URL and handle it
    if (urlParams.get('success') === 'true') {
      const sessionId = urlParams.get('session_id');
      console.log('🎉 Checkout success detected:', { sessionId });
      
      // Clean up URL immediately to prevent overlay issues
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Show success toast
      toast({
        title: "Payment Successful!",
        description: "Your subscription is being activated. This may take up to 2 minutes...",
        duration: 8000,
      });

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
          
          // Final success message after the last attempt
          setTimeout(() => {
            toast({
              title: "Subscription Status Updated!",
              description: "Please refresh the page if you don't see your plan activated.",
              duration: 5000,
            });
          }, 65000);
        }
      };

      // Start the aggressive refresh process
      setTimeout(aggressiveRefresh, 1000);
      
      // Switch to subscription tab to show the updated status
      setActiveTab('subscription');
    }
  }, [user?.id, refetch, toast]);

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

  // Get user's subscription tier - fix the display logic
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

  // Define available tabs based on subscription - renamed Apps to Tools
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'chat', icon: MessageCircle, label: 'Chat' },
    ];

    // Tools available for Pro and ProMax
    if (subscriptionTier === 'pro' || subscriptionTier === 'enterprise') {
      baseTabs.push({ id: 'apps', icon: Wrench, label: 'Tools' });
    }

    // Advanced Search only for ProMax
    if (subscriptionTier === 'enterprise') {
      baseTabs.push({ id: 'search', icon: Search, label: 'Search' });
      baseTabs.push({ id: 'projects', icon: FolderOpen, label: 'Projects' });
    }

    // Always available tabs
    baseTabs.push(
      { id: 'notifications', icon: Bell, label: 'Updates' },
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'subscription', icon: Crown, label: 'Plans' } // Always show subscription tab
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

  const handleStartNewChat = (projectId: string) => {
    console.log('Starting new chat for project:', projectId);
    setCurrentProjectId(projectId);
    setActiveTab('chat');
  };

  const handleChatComplete = () => {
    // Reset project context when chat is done or user navigates away
    setCurrentProjectId(null);
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
        if (subscriptionTier !== 'pro' && subscriptionTier !== 'enterprise') {
          return <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Subscription Required</h2>
              <p className="text-gray-400 mb-6">Building Tools are available for Pro and ProMax subscribers.</p>
              <button 
                onClick={handleViewPlans}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Choose a Plan
              </button>
            </div>
          </div>;
        }
        return <AppsScreen user={user} />;
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
        return <ProjectsScreen user={user} onStartNewChat={handleStartNewChat} />;
      case 'notifications':
        return <NotificationsScreen />;
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
        className="glass border-b border-white/5 px-6 py-4 flex-shrink-0 safe-area-top"
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="w-40 h-24 flex items-center">
              <img 
                src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png" 
                alt="EezyBuild Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="ml-4">
              {currentProjectId && (
                <p className="text-sm text-emerald-400">Project Chat Mode</p>
              )}
            </div>
          </motion.div>
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
      </motion.header>

      {/* Main Content - fills space between header and nav with proper mobile spacing */}
      <main className="flex-1 min-h-0 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="h-full overflow-y-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Fixed and responsive with proper centering */}
      <motion.nav 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-4 py-3 safe-area-bottom"
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
                  className={`relative flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 flex-1 min-w-0 ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-300 backdrop-blur-sm border border-emerald-500/20' 
                      : 'text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'text-emerald-300' : ''
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


import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Mail, Calendar, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface ProfileScreenProps {
  user: any;
  onNavigateToSettings?: () => void;
  onNavigateToAccountSettings?: () => void;
}

const ProfileScreen = ({ user, onNavigateToSettings, onNavigateToAccountSettings }: ProfileScreenProps) => {
  const { subscription, hasActiveSubscription } = useSubscription(user?.id);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:info@eezybuild.com?subject=Support Request';
  };

  const menuItems = [
    {
      icon: Settings,
      label: 'Account Settings',
      description: 'Manage your account preferences',
      action: () => onNavigateToAccountSettings?.()
    },
    {
      icon: Crown,
      label: 'Subscription',
      description: 'Manage your subscription plan',
      action: () => onNavigateToSettings?.()
    },
    {
      icon: Mail,
      label: 'Contact Support',
      description: 'Get help from our team',
      action: handleContactSupport
    }
  ];

  // Calculate member since date
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : 'January 2024';

  // Get subscription details
  const subscriptionTier = subscription?.plan_type 
    ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
    : 'Free';

  const subscriptionEndDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover bg-gray-800"
            />
            {hasActiveSubscription && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">{user?.name || 'User'}</h1>
          <p className="text-gray-400 mb-2">{user?.email}</p>
          {hasActiveSubscription && (
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">{subscriptionTier} Plan</span>
            </div>
          )}
        </motion.div>

        {/* Stats - placeholder for now, will be updated with real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Queries This Month</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {hasActiveSubscription ? 'Unlimited' : '0'}
            </div>
            <div className="text-sm text-gray-400">Remaining Queries</div>
          </div>
        </motion.div>

        {/* Menu items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={item.action}
                className="w-full bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800 hover:border-gray-700 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                      <Icon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-white">{item.label}</h3>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/30 rounded-2xl p-4 border border-gray-800 mb-6"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Member since {memberSince}</span>
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">
              {user?.email_confirmed_at ? 'Verified account' : 'Account not verified'}
            </span>
          </div>
          {hasActiveSubscription && subscriptionEndDate && (
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">
                Subscription expires {subscriptionEndDate}
              </span>
            </div>
          )}
        </motion.div>

        {/* Sign out button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleSignOut}
            variant="outline" 
            className="w-full h-12 border-red-600/30 text-red-400 hover:bg-red-600/10 hover:border-red-500 rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Crown,
  Settings,
  LogOut,
  Shield,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AccountSettingsScreen from './AccountSettingsScreen';

interface ProfileScreenProps {
  user: any;
  onNavigateToSettings: () => void;
  onNavigateToAccountSettings?: () => void;
}

const ProfileScreen = ({ user, onNavigateToSettings }: ProfileScreenProps) => {
  const { subscription, hasActiveSubscription, refetch, openCustomerPortal } = useSubscription(user?.id);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const { toast } = useToast();

  // Fetch user profile data from the profiles table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setUserProfile(data);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleManageSubscription = async () => {
    if (hasActiveSubscription) {
      try {
        await openCustomerPortal();
      } catch (error) {
        toast({
          title: "Unable to open subscription management",
          description: "Please try again later or contact support if the issue persists.",
          variant: "destructive"
        });
      }
    } else {
      onNavigateToSettings();
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any cached data and redirect
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Calculate member since date (user creation date or fallback)
  const getMemberSinceDate = () => {
    if (user?.created_at) {
      return new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Fallback - estimate based on email or use a default
    return 'January 2024';
  };

  // Get subscription expiration date
  const getSubscriptionExpiration = () => {
    if (!hasActiveSubscription || !subscription?.current_period_end) {
      return 'N/A';
    }

    return new Date(subscription.current_period_end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = () => {
    if (!hasActiveSubscription || !subscription) return 'No Plan';

    switch (subscription.plan_type) {
      case 'basic':
        return 'EezyBuild';
      case 'pro':
        return 'Pro';
      case 'enterprise':
        return 'ProMax';
      default:
        return 'Unknown Plan';
    }
  };

  const handleAccountSettings = () => {
    setShowAccountSettings(true);
  };

  const handleBackFromAccountSettings = () => {
    setShowAccountSettings(false);
  };

  if (showAccountSettings) {
    return (
      <AccountSettingsScreen
        user={user}
        onBack={handleBackFromAccountSettings}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left mb-8 gap-4"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto sm:mx-0">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{userProfile?.full_name || user?.name || 'User'}</h1>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">Member since {getMemberSinceDate()}</p>
          </div>
        </motion.div>

        {/* Subscription Status - Always visible immediately */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {hasActiveSubscription ? (
            <Card className="relative overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-gray-900/80 to-emerald-950/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="flex  flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="relative subs-icon-profile flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-emerald-300 uppercase tracking-wider">Active Subscription</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {getPlanDisplayName()} Plan
                      </h3>
                      <p className="text-gray-300 text-base mb-4">
                        Your premium subscription is active and ready to use
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            Renews {getSubscriptionExpiration()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-emerald-300 font-medium text-base">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      onClick={handleManageSubscription}
                      size="lg"
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 px-6 py-3 font-medium"
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Subscription Status</h3>
                    <p className="text-sm text-gray-400">No Active Plan</p>
                  </div>
                </div>
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* User Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <User className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="text-white">{userProfile?.full_name || 'Not provided'}</p>
              </div>
            </div>

            {userProfile?.occupation && (
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <User className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-gray-400">Occupation</p>
                  <p className="text-white">{userProfile.occupation}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Button
            onClick={handleAccountSettings}
            variant="outline"
            className="w-full h-12 bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 text-white hover:text-white"
          >
            <Settings className="w-5 h-5 mr-3" />
            Account Settings
          </Button>

          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            variant="outline"
            className="w-full h-12 bg-red-900/20 border-red-700/50 hover:bg-red-800/30 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;

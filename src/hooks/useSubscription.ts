
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  current_period_end: string;
}

interface CachedSubscriptionData {
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  hasUsedTrial: boolean;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // Reduced to 5 minutes for better responsiveness
const STORAGE_KEY = 'subscription_cache';

// Get initial data from localStorage
const getInitialCacheData = (userId: string | null): CachedSubscriptionData | null => {
  if (!userId) return null;
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (error) {
    console.log('Failed to parse cached subscription data:', error);
  }
  return null;
};

// Save data to localStorage
const saveCacheData = (userId: string, data: CachedSubscriptionData) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
  } catch (error) {
    console.log('Failed to save subscription cache:', error);
  }
};

export const useSubscription = (userId: string | null) => {
  const initialCacheData = getInitialCacheData(userId);
  
  const [subscription, setSubscription] = useState<Subscription | null>(
    initialCacheData?.subscription || null
  );
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(
    initialCacheData?.hasActiveSubscription || false
  );
  const [hasUsedTrial, setHasUsedTrial] = useState(
    initialCacheData?.hasUsedTrial || false
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const lastCheckRef = useRef<number>(0);

  // Update cache and state
  const updateSubscriptionData = (
    subscriptionData: Subscription | null,
    hasActive: boolean,
    trialUsed: boolean,
    userId: string
  ) => {
    const cacheData: CachedSubscriptionData = {
      subscription: subscriptionData,
      hasActiveSubscription: hasActive,
      hasUsedTrial: trialUsed,
      timestamp: Date.now()
    };

    setSubscription(subscriptionData);
    setHasActiveSubscription(hasActive);
    setHasUsedTrial(trialUsed);
    saveCacheData(userId, cacheData);
  };

  // Main effect to handle subscription checking
  useEffect(() => {
    if (!userId) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setHasUsedTrial(false);
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }

    // Clear any stale cache to force fresh check after database update
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
    console.log('🧹 Cleared subscription cache to force fresh check');
    
    // Force immediate fresh check
    console.log('🔄 Starting immediate subscription check after database migration');
    checkSubscriptionStatus(false);
  }, [userId]);

  const checkSubscriptionStatus = async (isBackgroundUpdate = false) => {
    if (!userId) return;

    // Allow more frequent checks during initial setup
    const now = Date.now();
    const minInterval = isInitialLoad ? 1000 : 3000;
    
    if (now - lastCheckRef.current < minInterval) {
      console.log('⏭️ Skipping check - too recent');
      return;
    }
    lastCheckRef.current = now;

    if (!isBackgroundUpdate) {
      setLoading(true);
    }

    try {
      console.log('🔍 Checking subscription status for user:', userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found');
        setLoading(false);
        return;
      }

      console.log('📡 Calling check-subscription function...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Subscription check failed:', error);
        setLoading(false);
        return;
      }

      console.log('📋 Full subscription response:', data);

      if (data.subscribed && data.subscription_tier) {
        console.log('✅ Active subscription found:', data);
        const subscriptionData: Subscription = {
          id: 'stripe-sub',
          plan_type: data.subscription_tier,
          status: 'active',
          current_period_end: data.subscription_end
        };
        
        updateSubscriptionData(
          subscriptionData, 
          true, 
          data.has_used_trial || false, 
          userId
        );
        
        console.log('🎯 Subscription state updated:', { 
          hasActiveSubscription: true, 
          tier: data.subscription_tier,
          hasUsedTrial: data.has_used_trial 
        });
        
        if (!isBackgroundUpdate) {
          toast({
            title: "Subscription Active!",
            description: `Your ${data.subscription_tier} plan is now active.`,
            duration: 5000,
          });
        }
      } else {
        console.log('❌ No active subscription found, response:', data);
        updateSubscriptionData(
          null, 
          false, 
          data.has_used_trial || false, 
          userId
        );
        
        if (!isBackgroundUpdate && isInitialLoad) {
          toast({
            title: "No Active Subscription",
            description: "Please select a plan to get started.",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('💥 Error checking subscription:', error);
      toast({
        title: "Connection Error",
        description: "Failed to check subscription status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const createCheckoutSession = async (planType: 'basic' | 'pro' | 'enterprise') => {
    try {
      console.log('🛒 Creating checkout session for plan:', planType);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        console.log('🔗 Redirecting to Stripe checkout', { withTrial: data.has_trial });
        
        // Show appropriate message based on trial eligibility
        if (data.has_trial) {
          toast({
            title: "Starting Free Trial",
            description: "You'll get 7 days free, then be charged monthly.",
            duration: 4000,
          });
        } else {
          toast({
            title: "Upgrading Plan",
            description: "You'll be charged immediately as you've already used your free trial.",
            duration: 4000,
          });
        }
        
        window.location.href = data.url;
      }

      return true;
    } catch (error) {
      console.error('💥 Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const openCustomerPortal = async () => {
    try {
      console.log('🏢 Opening customer portal...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('📡 Calling customer-portal function...');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Customer portal error:', error);
        throw error;
      }

      if (data.url) {
        console.log('🔗 Performing full page redirect to customer portal:', data.url);
        window.location.replace(data.url);
      }

      return true;
    } catch (error) {
      console.error('💥 Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    subscription,
    loading,
    hasActiveSubscription,
    hasUsedTrial,
    isInitialLoad,
    refetch: () => checkSubscriptionStatus(false),
    createCheckoutSession,
    openCustomerPortal
  };
};

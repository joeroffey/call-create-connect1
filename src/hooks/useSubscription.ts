
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
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
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
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(
    initialCacheData?.hasActiveSubscription || false
  );
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const { toast } = useToast();
  const lastCheckRef = useRef<number>(0);

  // Check if we need to refresh data
  const shouldRefreshData = (cachedData: CachedSubscriptionData | null): boolean => {
    if (!cachedData) return true;
    return (Date.now() - cachedData.timestamp) >= CACHE_DURATION;
  };

  // Update cache and state
  const updateSubscriptionData = (
    subscriptionData: Subscription | null,
    hasActive: boolean,
    userId: string
  ) => {
    const cacheData: CachedSubscriptionData = {
      subscription: subscriptionData,
      hasActiveSubscription: hasActive,
      timestamp: Date.now()
    };

    setSubscription(subscriptionData);
    setHasActiveSubscription(hasActive);
    saveCacheData(userId, cacheData);
  };

  // Main effect to handle subscription checking
  useEffect(() => {
    if (!userId) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }

    const cachedData = getInitialCacheData(userId);
    
    // Always set the cached data immediately
    if (cachedData) {
      setSubscription(cachedData.subscription);
      setHasActiveSubscription(cachedData.hasActiveSubscription);
      console.log('📦 Using cached subscription data immediately');
    }

    setLoading(false);
    setIsInitialLoad(false);
    
    // Check if we need to refresh in the background
    if (shouldRefreshData(cachedData)) {
      console.log('🔄 Cache is stale or missing, updating in background');
      checkSubscriptionStatus(true);
    }
  }, [userId]);

  const checkSubscriptionStatus = async (isBackgroundUpdate = false) => {
    if (!userId) return;

    // Prevent multiple simultaneous checks
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) {
      console.log('⏭️ Skipping check - too recent');
      return;
    }
    lastCheckRef.current = now;

    try {
      console.log('🔍 Checking subscription status for user:', userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found');
        return;
      }

      console.log('📡 Calling check-subscription function...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Stripe check failed:', error);
        // Don't clear existing data on error
        return;
      }

      if (data.subscribed && data.subscription_tier) {
        console.log('✅ Active subscription found:', data);
        const subscriptionData: Subscription = {
          id: 'stripe-sub',
          plan_type: data.subscription_tier,
          status: 'active',
          current_period_end: data.subscription_end
        };
        
        updateSubscriptionData(subscriptionData, true, userId);
        console.log('🎯 Subscription state updated:', { hasActiveSubscription: true, tier: data.subscription_tier });
        
        if (!isBackgroundUpdate) {
          toast({
            title: "Subscription Updated!",
            description: `Your ${data.subscription_tier} plan is active.`,
            duration: 3000,
          });
        }
      } else {
        console.log('❌ No active subscription found');
        updateSubscriptionData(null, false, userId);
      }
    } catch (error) {
      console.error('💥 Error checking subscription:', error);
      // Don't clear existing data on error
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
        console.log('🔗 Redirecting to Stripe checkout');
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
    isInitialLoad,
    refetch: () => checkSubscriptionStatus(false),
    createCheckoutSession,
    openCustomerPortal
  };
};

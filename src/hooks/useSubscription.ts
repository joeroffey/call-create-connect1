import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  current_period_end: string;
}

// Simple in-memory cache for subscription data
const subscriptionCache = new Map<string, {
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  timestamp: number;
}>();

const CACHE_DURATION = 30000; // 30 seconds

export const useSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false); // Changed default to false
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false); // Changed default to false
  const { toast } = useToast();
  const cacheKeyRef = useRef<string>('');

  // Generate cache key
  const getCacheKey = (userId: string) => `subscription_${userId}`;

  // Load from cache immediately if available
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }

    const cacheKey = getCacheKey(userId);
    cacheKeyRef.current = cacheKey;
    const cached = subscriptionCache.get(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached subscription data immediately');
      setSubscription(cached.subscription);
      setHasActiveSubscription(cached.hasActiveSubscription);
      setLoading(false);
      setIsInitialLoad(false);
      
      // Check if cache is stale and update in background if needed
      if ((Date.now() - cached.timestamp) >= CACHE_DURATION) {
        console.log('🔄 Cache is stale, updating in background');
        checkSubscriptionStatus(0, true);
      }
    } else {
      // No cache, need to load
      setLoading(true);
      setIsInitialLoad(true);
      checkSubscriptionStatus();
    }
  }, [userId]);

  const checkSubscriptionStatus = async (retryCount = 0, isBackgroundUpdate = false) => {
    if (!userId) {
      setLoading(false);
      setIsInitialLoad(false);
      return;
    }

    try {
      console.log(`🔍 Checking subscription status for user (attempt ${retryCount + 1}):`, userId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found');
        setLoading(false);
        setIsInitialLoad(false);
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
        
        if (retryCount < 2 && !isBackgroundUpdate) { // Reduced retry count for faster response
          const delay = (retryCount + 1) * 2000; // Reduced delay
          console.log(`⏳ Retrying subscription check in ${delay/1000} seconds...`);
          setTimeout(() => {
            checkSubscriptionStatus(retryCount + 1, isBackgroundUpdate);
          }, delay);
          return;
        }
        
        setSubscription(null);
        setHasActiveSubscription(false);
        
        // Update cache
        subscriptionCache.set(cacheKeyRef.current, {
          subscription: null,
          hasActiveSubscription: false,
          timestamp: Date.now()
        });
      } else if (data.subscribed && data.subscription_tier) {
        console.log('✅ Active subscription found:', data);
        const subscriptionData: Subscription = {
          id: 'stripe-sub',
          plan_type: data.subscription_tier,
          status: 'active',
          current_period_end: data.subscription_end
        };
        
        setSubscription(subscriptionData);
        setHasActiveSubscription(true);
        console.log('🎯 Subscription state updated:', { hasActiveSubscription: true, tier: data.subscription_tier });
        
        // Update cache
        subscriptionCache.set(cacheKeyRef.current, {
          subscription: subscriptionData,
          hasActiveSubscription: true,
          timestamp: Date.now()
        });
        
        if (retryCount > 0 && !isBackgroundUpdate) {
          toast({
            title: "Subscription Found!",
            description: `Your ${data.subscription_tier} plan is now active.`,
            duration: 5000,
          });
        }
      } else {
        console.log('❌ No active subscription found in response:', data);
        
        if (retryCount < 2 && !isBackgroundUpdate) { // Reduced retry count
          const delay = (retryCount + 1) * 3000; // Reduced delay
          console.log(`⏳ Retrying subscription check in ${delay/1000} seconds...`);
          setTimeout(() => {
            checkSubscriptionStatus(retryCount + 1, isBackgroundUpdate);
          }, delay);
          return;
        }
        
        setSubscription(null);
        setHasActiveSubscription(false);
        
        // Update cache
        subscriptionCache.set(cacheKeyRef.current, {
          subscription: null,
          hasActiveSubscription: false,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('💥 Error checking subscription:', error);
      
      if (retryCount < 2 && !isBackgroundUpdate) { // Reduced retry count
        const delay = (retryCount + 1) * 2000; // Reduced delay
        console.log(`⏳ Retrying subscription check due to error in ${delay/1000} seconds...`);
        setTimeout(() => {
          checkSubscriptionStatus(retryCount + 1, isBackgroundUpdate);
        }, delay);
        return;
      }
      
      setSubscription(null);
      setHasActiveSubscription(false);
      
      // Update cache with error state
      subscriptionCache.set(cacheKeyRef.current, {
        subscription: null,
        hasActiveSubscription: false,
        timestamp: Date.now()
      });
    } finally {
      if (!isBackgroundUpdate) {
        setLoading(false);
        setIsInitialLoad(false);
      }
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

  // Clear cache when user changes
  useEffect(() => {
    return () => {
      if (cacheKeyRef.current) {
        subscriptionCache.delete(cacheKeyRef.current);
      }
    };
  }, [userId]);

  return {
    subscription,
    loading,
    hasActiveSubscription,
    isInitialLoad,
    refetch: () => checkSubscriptionStatus(0),
    createCheckoutSession,
    openCustomerPortal
  };
};

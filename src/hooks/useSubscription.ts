
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  current_period_end: string;
}

export const useSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { toast } = useToast();

  const checkSubscriptionStatus = async (retryCount = 0) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log(`🔍 Checking subscription status for user (attempt ${retryCount + 1}):`, userId);
      
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
        console.error('❌ Stripe check failed:', error);
        
        // If we're retrying after a successful checkout and still no subscription found,
        // wait a bit longer and try again (up to 5 times with longer delays)
        if (retryCount < 4) {
          const delay = (retryCount + 1) * 5000; // 5s, 10s, 15s, 20s
          console.log(`⏳ Retrying subscription check in ${delay/1000} seconds...`);
          setTimeout(() => {
            checkSubscriptionStatus(retryCount + 1);
          }, delay);
          return;
        }
        
        setSubscription(null);
        setHasActiveSubscription(false);
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
        
        // Show success message if this is a retry (likely after checkout)
        if (retryCount > 0) {
          toast({
            title: "Subscription Found!",
            description: `Your ${data.subscription_tier} plan is now active.`,
            duration: 5000,
          });
        }
      } else {
        console.log('❌ No active subscription found in response:', data);
        
        // If we're retrying after a successful checkout and still no subscription found,
        // wait longer and try again (up to 5 times)
        if (retryCount < 4) {
          const delay = (retryCount + 1) * 8000; // 8s, 16s, 24s, 32s
          console.log(`⏳ Retrying subscription check in ${delay/1000} seconds...`);
          setTimeout(() => {
            checkSubscriptionStatus(retryCount + 1);
          }, delay);
          return;
        }
        
        setSubscription(null);
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('💥 Error checking subscription:', error);
      
      // If we're retrying after a successful checkout, try again with longer delays
      if (retryCount < 4) {
        const delay = (retryCount + 1) * 5000;
        console.log(`⏳ Retrying subscription check due to error in ${delay/1000} seconds...`);
        setTimeout(() => {
          checkSubscriptionStatus(retryCount + 1);
        }, delay);
        return;
      }
      
      setSubscription(null);
      setHasActiveSubscription(false);
    } finally {
      if (retryCount === 0 || retryCount >= 4) {
        setLoading(false);
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

      // Open Stripe checkout in the same tab to avoid overlay issues
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

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open in same tab to avoid overlay issues
      if (data.url) {
        console.log('🔗 Redirecting to customer portal');
        window.location.href = data.url;
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

  useEffect(() => {
    checkSubscriptionStatus();
  }, [userId]);

  return {
    subscription,
    loading,
    hasActiveSubscription,
    refetch: checkSubscriptionStatus,
    createCheckoutSession,
    openCustomerPortal
  };
};

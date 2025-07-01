
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  current_period_end: string;
  trial_end?: string;
}

export const useSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { toast } = useToast();

  const checkSubscriptionStatus = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking subscription status for user:', userId);
      
      // Check Stripe subscription status
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      console.log('Checking Stripe subscription...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Stripe check failed:', error);
        setSubscription(null);
        setHasActiveSubscription(false);
      } else if (data.subscribed && data.subscription_tier) {
        console.log('Found Stripe subscription:', data);
        const subscriptionData: Subscription = {
          id: 'stripe-sub',
          plan_type: data.subscription_tier,
          status: data.status || 'active',
          current_period_end: data.subscription_end,
          trial_end: data.trial_end
        };
        
        setSubscription(subscriptionData);
        setHasActiveSubscription(true);
      } else {
        console.log('No active subscription found');
        setSubscription(null);
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planType: 'basic' | 'pro' | 'enterprise') => {
    try {
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

      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }

      return true;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive"
      });
      return false;
    }
  };

  const openCustomerPortal = async () => {
    try {
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

      // Open customer portal in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }

      return true;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
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

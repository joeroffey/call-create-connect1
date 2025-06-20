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

  const checkSubscriptionStatus = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking subscription status for user:', userId);
      
      // First check local database for demo subscriptions
      const { data: localSub, error: localError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (localSub && !localError) {
        console.log('Found local demo subscription:', localSub);
        const subscriptionData: Subscription = {
          id: localSub.id,
          plan_type: localSub.plan_type as 'basic' | 'pro' | 'enterprise',
          status: localSub.status as 'active' | 'cancelled' | 'expired',
          current_period_end: localSub.current_period_end
        };
        
        setSubscription(subscriptionData);
        setHasActiveSubscription(true);
        setLoading(false);
        return;
      }

      // If no local subscription, check Stripe
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      console.log('No local subscription found, checking Stripe...');
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
          status: 'active',
          current_period_end: data.subscription_end
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

  const createDemoSubscription = async () => {
    if (!userId) return false;

    try {
      // Create a demo subscription for testing - expires in 30 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      // First, try to upsert (update if exists, insert if not)
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_type: 'pro',
          status: 'active',
          current_period_end: endDate.toISOString()
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      let subscriptionData;

      if (error) {
        console.error('Upsert failed, trying update:', error);
        
        // If upsert fails, try to update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_type: 'pro',
            status: 'active',
            current_period_end: endDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        
        subscriptionData = updateData;
      } else {
        subscriptionData = data;
      }

      const typedSubscription: Subscription = {
        id: subscriptionData.id,
        plan_type: subscriptionData.plan_type as 'basic' | 'pro' | 'enterprise',
        status: subscriptionData.status as 'active' | 'cancelled' | 'expired',
        current_period_end: subscriptionData.current_period_end
      };

      setSubscription(typedSubscription);
      setHasActiveSubscription(true);
      
      toast({
        title: "Demo Subscription Activated",
        description: "You now have a 30-day demo subscription to test the app!"
      });

      return true;
    } catch (error) {
      console.error('Error creating demo subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create demo subscription",
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
    createDemoSubscription,
    createCheckoutSession,
    openCustomerPortal
  };
};

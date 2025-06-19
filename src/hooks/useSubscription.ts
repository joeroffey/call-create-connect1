
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

  const fetchSubscription = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Type cast the data to ensure it matches our interface
        const typedSubscription: Subscription = {
          id: data.id,
          plan_type: data.plan_type as 'basic' | 'pro' | 'enterprise',
          status: data.status as 'active' | 'cancelled' | 'expired',
          current_period_end: data.current_period_end
        };
        
        setSubscription(typedSubscription);
        const isActive = data.status === 'active' && new Date(data.current_period_end) > new Date();
        setHasActiveSubscription(isActive);
      } else {
        setSubscription(null);
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoSubscription = async () => {
    if (!userId) return false;

    try {
      // Create a demo subscription for testing - expires in 30 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: 'pro',
          status: 'active',
          current_period_end: endDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Type cast the returned data
      const typedSubscription: Subscription = {
        id: data.id,
        plan_type: data.plan_type as 'basic' | 'pro' | 'enterprise',
        status: data.status as 'active' | 'cancelled' | 'expired',
        current_period_end: data.current_period_end
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
    fetchSubscription();
  }, [userId]);

  return {
    subscription,
    loading,
    hasActiveSubscription,
    refetch: fetchSubscription,
    createDemoSubscription
  };
};

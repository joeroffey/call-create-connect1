
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      // Also update subscriptions table
      const { data: existingSub } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (existingSub) {
        await supabaseClient
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', user.id);
      }
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });
    
    let hasActiveSub = false;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let subscriptionStatus = null;
    let trialEnd = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      
      if (isActive) {
        hasActiveSub = true;
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        subscriptionStatus = subscription.status;
        
        if (subscription.trial_end) {
          trialEnd = new Date(subscription.trial_end * 1000).toISOString();
        }
        
        logStep("Active subscription found", { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          endDate: subscriptionEnd,
          trialEnd 
        });
        
        // Determine subscription tier from price amount
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        if (amount <= 1499) {
          subscriptionTier = "basic";
        } else if (amount <= 2999) {
          subscriptionTier = "pro";
        } else {
          subscriptionTier = "enterprise";
        }
        logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
      }
    }

    if (!hasActiveSub) {
      logStep("No active subscription found");
    }

    // Update both tables
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Update or create subscription record
    if (hasActiveSub && subscriptionTier && subscriptionEnd) {
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        plan_type: subscriptionTier,
        status: subscriptionStatus === 'trialing' ? 'active' : subscriptionStatus,
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      status: subscriptionStatus 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      status: subscriptionStatus,
      trial_end: trialEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

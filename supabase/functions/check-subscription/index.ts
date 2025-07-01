
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
        has_used_trial: false, // Initialize trial usage tracking
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
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        has_used_trial: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check all subscription statuses, not just active ones
    const allSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    logStep("All subscriptions found", { 
      count: allSubscriptions.data.length,
      subscriptions: allSubscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        trial_end: sub.trial_end
      }))
    });

    // Check if user has ever had a trial (including expired ones)
    const hasUsedTrial = allSubscriptions.data.some(sub => sub.trial_end !== null);
    logStep("Trial usage check", { hasUsedTrial });

    // Look for active, trialing, or past_due subscriptions
    const activeSubscriptions = allSubscriptions.data.filter(sub => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );
    logStep("Filtered active subscriptions", { 
      count: activeSubscriptions.length,
      activeStatuses: activeSubscriptions.map(sub => sub.status)
    });

    const hasActiveSub = activeSubscriptions.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = activeSubscriptions[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        endDate: subscriptionEnd 
      });
      
      // Determine subscription tier from price amount - FIXED PRICING THRESHOLDS
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      // Updated thresholds to match actual pricing:
      // Basic (EezyBuild): £14.99 = 1499 pence
      // Pro: £29.99 = 2999 pence  
      // Enterprise (ProMax): £59.99 = 5999 pence
      if (amount <= 1499) {
        subscriptionTier = "basic";
      } else if (amount <= 2999) {
        subscriptionTier = "pro";
      } else {
        subscriptionTier = "enterprise";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
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
      has_used_trial: hasUsedTrial, // Track trial usage
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Update or create subscription record
    if (hasActiveSub && subscriptionTier && subscriptionEnd) {
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        plan_type: subscriptionTier,
        status: 'active',
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier,
      hasUsedTrial 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      has_used_trial: hasUsedTrial
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

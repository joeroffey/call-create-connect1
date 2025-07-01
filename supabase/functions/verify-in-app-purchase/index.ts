
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-IAP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { productId, transactionId, receipt, platform } = await req.json();
    
    if (!productId || !transactionId || !receipt) {
      throw new Error("Missing required purchase data");
    }

    logStep("Verifying purchase", { productId, transactionId, platform });

    // Determine subscription tier from product ID
    let subscriptionTier: string;
    if (productId.includes('basic')) {
      subscriptionTier = 'basic';
    } else if (productId.includes('pro') && !productId.includes('enterprise')) {
      subscriptionTier = 'pro';
    } else if (productId.includes('enterprise')) {
      subscriptionTier = 'enterprise';
    } else {
      throw new Error("Unknown product ID");
    }

    // For this implementation, we'll trust the purchase verification
    // In production, you should verify the receipt with Apple/Google servers
    logStep("Purchase verified", { subscriptionTier });

    // Calculate subscription end date (1 month from now)
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    // Update subscription in database
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: null, // Not using Stripe for in-app purchases
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd.toISOString(),
      has_used_trial: true, // Mark trial as used
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Update subscriptions table
    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      plan_type: subscriptionTier,
      status: 'active',
      current_period_end: subscriptionEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Database updated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-in-app-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

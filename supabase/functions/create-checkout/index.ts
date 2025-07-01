
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

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

    const { planType } = await req.json();
    if (!planType || !['basic', 'pro', 'enterprise'].includes(planType)) {
      throw new Error("Invalid plan type");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists and their trial usage
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    let hasUsedTrial = false;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
      
      // Check if they've ever had a trial by looking at all their subscriptions
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 10,
      });
      
      hasUsedTrial = allSubscriptions.data.some(sub => sub.trial_end !== null);
      logStep("Trial usage check", { hasUsedTrial });
    } else {
      logStep("Creating new customer - eligible for trial");
      hasUsedTrial = false;
    }

    // Also check our database for trial usage tracking
    const { data: subscriberData } = await supabaseClient
      .from('subscribers')
      .select('has_used_trial')
      .eq('email', user.email)
      .single();

    if (subscriberData?.has_used_trial) {
      hasUsedTrial = true;
      logStep("Database confirms trial already used");
    }

    // Define pricing for each tier
    const pricing = {
      basic: { amount: 1499, name: "EezyBuild Basic" }, // £14.99
      pro: { amount: 2999, name: "EezyBuild Pro" }, // £29.99
      enterprise: { amount: 5999, name: "EezyBuild ProMax" } // £59.99
    };

    const selectedPlan = pricing[planType as keyof typeof pricing];
    
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: selectedPlan.name,
              description: `${selectedPlan.name} subscription - Building Regulations AI Assistant`
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin") || "http://localhost:3000"}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:3000"}/?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType
      }
    };

    // Only add trial if user hasn't used one before
    if (!hasUsedTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: 7
      };
      logStep("Creating checkout session with 7-day trial", { planType, amount: selectedPlan.amount });
    } else {
      logStep("Creating checkout session without trial (already used)", { planType, amount: selectedPlan.amount });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      withTrial: !hasUsedTrial 
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      has_trial: !hasUsedTrial 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

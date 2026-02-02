import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Stripe product IDs to subscription tiers
const PRODUCT_TO_TIER: Record<string, string> = {
  "prod_TuE4mwtUnj7Ott": "researcher_lite",
  "prod_TuE58iFRJANG1f": "researcher_premium",
  "prod_TuE6k644OlPPWc": "industry_lite",
  "prod_TuE6z5enLtycmI": "industry_premium",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, user is on free tier");
      
      // Ensure user has a free subscription record in Supabase
      await syncSubscriptionToSupabase(supabaseClient, user.id, null);
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        tier: "free",
        productId: null,
        subscriptionEnd: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscription found");
      
      await syncSubscriptionToSupabase(supabaseClient, user.id, null);
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        tier: "free",
        productId: null,
        subscriptionEnd: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0]?.price?.product as string;
    const tier = PRODUCT_TO_TIER[productId] || "free";
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const billingPeriod = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';
    
    logStep("Active subscription found", { 
      subscriptionId: subscription.id, 
      productId, 
      tier,
      endDate: subscriptionEnd,
      billingPeriod
    });

    // Sync to Supabase
    await syncSubscriptionToSupabase(supabaseClient, user.id, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      tier,
      billingPeriod,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: subscriptionEnd,
    });

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      productId,
      subscriptionEnd,
      billingPeriod,
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

interface SubscriptionData {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: string;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncSubscriptionToSupabase(
  supabase: any,
  userId: string,
  data: SubscriptionData | null
) {
  try {
    // Check if subscription record exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (data) {
      // User has active subscription
      const subscriptionData = {
        user_id: userId,
        tier: data.tier,
        status: 'active',
        billing_period: data.billingPeriod,
        stripe_customer_id: data.stripeCustomerId,
        stripe_subscription_id: data.stripeSubscriptionId,
        current_period_start: data.currentPeriodStart,
        current_period_end: data.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('subscriptions')
          .insert(subscriptionData);
      }
      logStep("Subscription synced to Supabase", { tier: data.tier });
    } else {
      // User has no active subscription - set to free
      if (existing) {
        await supabase
          .from('subscriptions')
          .update({
            tier: 'free',
            status: 'active',
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
      // Don't create a record for free users - they just don't have a subscription
      logStep("User set to free tier in Supabase");
    }
  } catch (error) {
    logStep("Error syncing to Supabase", { error: String(error) });
    // Don't throw - subscription check should still succeed even if sync fails
  }
}

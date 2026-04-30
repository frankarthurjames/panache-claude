import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { organizationId } = await req.json();

    if (!organizationId) {
      return new Response(JSON.stringify({
        connected: false,
        details_submitted: false,
        charges_enabled: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: orgData, error: orgError } = await supabaseClient
      .from('organizations')
      .select('stripe_account_id')
      .eq('id', organizationId)
      .single();

    if (orgError || !orgData?.stripe_account_id) {
      return new Response(JSON.stringify({
        connected: false,
        details_submitted: false,
        charges_enabled: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    const account = await stripe.accounts.retrieve(orgData.stripe_account_id);

    return new Response(JSON.stringify({
      connected: true,
      accountId: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in check-connect-status:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

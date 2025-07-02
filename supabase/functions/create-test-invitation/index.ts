import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestInvitationRequest {
  teamId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🧪 Creating test invitation");

    const { teamId, email, role }: TestInvitationRequest = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create team invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert([{
        team_id: teamId,
        email,
        role,
        invited_by: user.id
      }])
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating test invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create the invitation link
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('https://srwbgkssoatrhxdrrtff.supabase.co', 'https://preview--call-create-connect.lovable.app');
    const inviteLink = `${baseUrl}/team-invite?token=${invitation.id}`;

    console.log("✅ Test invitation created:", invitation.id);
    console.log("🔗 Invitation link:", inviteLink);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        inviteLink: inviteLink,
        message: `Test invitation created for ${email}`
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in create-test-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
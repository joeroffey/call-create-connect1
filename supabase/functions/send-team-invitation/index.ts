import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamInvitationRequest {
  teamId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  teamName: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Team invitation request received");

    const { teamId, email, role, teamName, inviterName }: TeamInvitationRequest = await req.json();

    // Validate required fields
    if (!teamId || !email || !role || !teamName || !inviterName) {
      console.error("Missing required fields:", { teamId, email, role, teamName, inviterName });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
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
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User authenticated:", user.id);

    // Check if user has permission to invite to this team
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !teamMember || !['owner', 'admin'].includes(teamMember.role)) {
      console.error("User not authorized to invite members:", memberError);
      return new Response(
        JSON.stringify({ error: "Not authorized to invite members" }),
        {
          status: 403,
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
      console.error("Error creating invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Invitation record created:", invitation.id);

    // Create the invitation link
    const inviteLink = `${Deno.env.get("SUPABASE_URL")?.replace('/supabase.co', '.lovable.app')}/team-invite?token=${invitation.id}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "EezyBuild <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${teamName} on EezyBuild`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0;">EezyBuild</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">You're invited to join a team!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> as a <strong>${role}</strong> on EezyBuild.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: linear-gradient(135deg, #059669, #047857); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #374151; margin-top: 0;">What is EezyBuild?</h3>
            <p style="color: #6b7280; margin-bottom: 0;">
              EezyBuild is a comprehensive platform for building regulation consultation, project management, and team collaboration. Join your team to access shared projects, tasks, and building regulation updates.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      // Don't fail the whole operation if email fails, just log it
      console.log("Invitation created but email failed to send");
    } else {
      console.log("Email sent successfully:", emailResponse.data?.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        invitationId: invitation.id
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
    console.error("Error in send-team-invitation function:", error);
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
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, CheckCircle } from 'lucide-react';

const TeamInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        console.log('TeamInvitePage: No token provided in URL');
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      console.log('TeamInvitePage: Loading invitation with token:', token);

      try {
        const { data, error } = await supabase
          .from('team_invitations')
          .select(`
            *,
            teams (name, description)
          `)
          .eq('id', token)
          .single();

        console.log('TeamInvitePage: Query result:', { data, error });

        if (error || !data) {
          console.log('TeamInvitePage: Invitation not found or error:', error);
          setError('Invitation not found or expired');
          setLoading(false);
          return;
        }

        if (data.accepted_at) {
          console.log('TeamInvitePage: Invitation already accepted at:', data.accepted_at);
          setError('This invitation has already been used');
          setLoading(false);
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          console.log('TeamInvitePage: Invitation expired at:', data.expires_at);
          setError('This invitation has expired');
          setLoading(false);
          return;
        }

        console.log('TeamInvitePage: Valid invitation loaded:', data);
        setInvitation(data);
      } catch (error) {
        console.error('TeamInvitePage: Error loading invitation:', error);
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    if (!invitation) {
      console.log('TeamInvitePage: No invitation data available');
      return;
    }

    console.log('TeamInvitePage: Accept invitation clicked');

    const { data: { user } } = await supabase.auth.getUser();
    console.log('TeamInvitePage: Current user:', user);
    
    if (!user) {
      console.log('TeamInvitePage: User not signed in, showing sign in message');
      toast({
        title: "Please sign in",
        description: "You need to be signed in to accept team invitations",
        variant: "destructive",
      });
      // Redirect to auth page or show sign in form
      navigate('/?showAuth=true');
      return;
    }

    setAccepting(true);
    try {
      console.log('TeamInvitePage: Adding user to team...');
      
      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by
        });

      console.log('TeamInvitePage: Member insert result:', { memberError });

      if (memberError) {
        console.error('TeamInvitePage: Error adding member:', memberError);
        throw memberError;
      }

      console.log('TeamInvitePage: Marking invitation as accepted...');
      
      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      console.log('TeamInvitePage: Invitation update result:', { inviteError });

      if (inviteError) {
        console.error('TeamInvitePage: Error updating invitation:', inviteError);
        throw inviteError;
      }

      console.log('TeamInvitePage: Success! Showing success message');
      
      toast({
        title: "Welcome to the team!",
        description: `You've successfully joined ${invitation.teams.name}`,
      });

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('TeamInvitePage: Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation. You might already be a member.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')} variant="outline">
              Go to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invitation?.teams?.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation?.teams?.description && (
            <p className="text-sm text-muted-foreground text-center">
              {invitation.teams.description}
            </p>
          )}
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Role: <span className="font-medium capitalize">{invitation?.role}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Invited by: {invitation?.email}
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={acceptInvitation} 
              disabled={accepting}
              className="w-full"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamInvitePage;
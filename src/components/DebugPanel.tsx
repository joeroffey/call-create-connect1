
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugPanel = ({ user }: { user: any }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString()
    };

    try {
      // Test projects query
      console.log('DebugPanel: Testing projects query...');
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id);
      
      info.projects = {
        data: projects,
        error: projectsError,
        count: projects?.length || 0
      };
      console.log('DebugPanel: Projects result:', info.projects);

      // Test teams query
      console.log('DebugPanel: Testing teams query...');
      const { data: memberTeams, error: teamsError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams!inner(*)
        `)
        .eq('user_id', user?.id);

      info.teams = {
        data: memberTeams,
        error: teamsError,
        count: memberTeams?.length || 0
      };
      console.log('DebugPanel: Teams result:', info.teams);

      // Test direct teams query
      console.log('DebugPanel: Testing direct teams ownership query...');
      const { data: ownedTeams, error: ownedTeamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user?.id);

      info.ownedTeams = {
        data: ownedTeams,
        error: ownedTeamsError,
        count: ownedTeams?.length || 0
      };
      console.log('DebugPanel: Owned teams result:', info.ownedTeams);

      // Test team_members table
      console.log('DebugPanel: Testing team_members query...');
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user?.id);

      info.teamMembers = {
        data: teamMembers,
        error: teamMembersError,
        count: teamMembers?.length || 0
      };
      console.log('DebugPanel: Team members result:', info.teamMembers);

    } catch (error) {
      console.error('DebugPanel: Error during diagnostics:', error);
      info.error = error;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      runDiagnostics();
    }
  }, [user?.id]);

  return (
    <Card className="bg-red-900/20 border-red-800 mb-4">
      <CardHeader>
        <CardTitle className="text-red-400">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading} className="bg-red-600 hover:bg-red-700">
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
        
        {debugInfo.user && (
          <div className="text-sm text-gray-300">
            <p><strong>User:</strong> {debugInfo.user.id} ({debugInfo.user.email})</p>
            <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
          </div>
        )}

        {debugInfo.projects && (
          <div className="text-sm text-gray-300 bg-gray-800 p-2 rounded">
            <p><strong>Projects:</strong> {debugInfo.projects.count} found</p>
            {debugInfo.projects.error && (
              <p className="text-red-400">Error: {JSON.stringify(debugInfo.projects.error)}</p>
            )}
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(debugInfo.projects.data, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.teams && (
          <div className="text-sm text-gray-300 bg-gray-800 p-2 rounded">
            <p><strong>Teams (via members):</strong> {debugInfo.teams.count} found</p>
            {debugInfo.teams.error && (
              <p className="text-red-400">Error: {JSON.stringify(debugInfo.teams.error)}</p>
            )}
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(debugInfo.teams.data, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.ownedTeams && (
          <div className="text-sm text-gray-300 bg-gray-800 p-2 rounded">
            <p><strong>Owned Teams:</strong> {debugInfo.ownedTeams.count} found</p>
            {debugInfo.ownedTeams.error && (
              <p className="text-red-400">Error: {JSON.stringify(debugInfo.ownedTeams.error)}</p>
            )}
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(debugInfo.ownedTeams.data, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.teamMembers && (
          <div className="text-sm text-gray-300 bg-gray-800 p-2 rounded">
            <p><strong>Team Members:</strong> {debugInfo.teamMembers.count} found</p>
            {debugInfo.teamMembers.error && (
              <p className="text-red-400">Error: {JSON.stringify(debugInfo.teamMembers.error)}</p>
            )}
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(debugInfo.teamMembers.data, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.error && (
          <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">
            <p><strong>Error:</strong> {JSON.stringify(debugInfo.error)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugPanel;

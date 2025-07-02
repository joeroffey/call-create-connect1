import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Save, AlertTriangle, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TeamLogoUpload from './TeamLogoUpload';
import CreateTeamModal from './CreateTeamModal';

interface TeamSettingsProps {
  team: any;
  onTeamUpdate: () => void;
  onTeamDelete: () => void;
  onCreateTeam: (name: string, description?: string) => Promise<any>;
  isOwner: boolean;
}

const TeamSettings = ({ team, onTeamUpdate, onTeamDelete, onCreateTeam, isOwner }: TeamSettingsProps) => {
  const [name, setName] = useState(team?.name || '');
  const [description, setDescription] = useState(team?.description || '');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: name.trim(),
          description: description.trim() || null
        })
        .eq('id', team.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team settings updated successfully",
      });

      onTeamUpdate();
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // Delete team (CASCADE will handle related records)
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      onTeamDelete();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogoUpdate = () => {
    onTeamUpdate();
  };

  return (
    <div className="space-y-8">
      {/* Team Information */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Logo Section */}
          <div>
            <Label className="text-white text-base font-medium mb-3 block">Team Logo</Label>
            <div className="flex items-center gap-4">
              <TeamLogoUpload
                teamId={team.id}
                currentLogoUrl={team.logo_url}
                onLogoUpdate={handleLogoUpdate}
              />
              <div className="text-sm text-gray-400">
                <p>Upload a logo for your team</p>
                <p>Max size: 5MB • PNG, JPG, JPEG</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="team-name" className="text-white">Team Name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
                className="bg-gray-800 border-gray-600 text-white"
                disabled={!isOwner}
              />
            </div>
            <div>
              <Label htmlFor="team-description" className="text-white">Description</Label>
              <Textarea
                id="team-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your team's purpose"
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
                disabled={!isOwner}
              />
            </div>
          </div>

          {isOwner && (
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading || !name.trim()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Stats */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm text-gray-400">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-400">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">0</div>
              <div className="text-sm text-gray-400">Total Activity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Create New Team</h4>
              <p className="text-gray-400 text-sm mb-4">
                Create additional teams to organize different projects or departments.
              </p>
              <CreateTeamModal 
                onCreateTeam={onCreateTeam}
                trigger={
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <Settings className="w-4 h-4 mr-2" />
                    Create New Team
                  </Button>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone (Owner Only) */}
      {isOwner && (
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/50">
          <CardHeader className="border-b border-red-700/50">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Delete Team</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Once you delete a team, there is no going back. This action will permanently delete 
                  the team and all associated data including projects, tasks, and member records.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone. This will permanently delete the team 
                        "{team?.name}" and all associated data including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All team projects and tasks</li>
                          <li>All member records and roles</li>
                          <li>All team activity and comments</li>
                          <li>All uploaded files and documents</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-600 text-gray-300">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteLoading ? 'Deleting...' : 'Yes, delete team'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isOwner && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Limited Access</h3>
              <p className="text-sm">Only team owners can modify team settings.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamSettings;
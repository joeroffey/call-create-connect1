
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CreateTeamModalProps {
  onCreateTeam: (name: string, description?: string) => Promise<any>;
  trigger?: React.ReactNode;
}

const CreateTeamModal = ({ onCreateTeam, trigger }: CreateTeamModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const result = await onCreateTeam(name.trim(), description.trim() || undefined);
      console.log('CreateTeamModal: Team creation result:', result);
      
      // Only close and reset if creation was successful
      if (result) {
        setName('');
        setDescription('');
        setOpen(false);
      }
    } catch (error) {
      console.error('CreateTeamModal: Error creating team:', error);
      // Don't close the modal on error, let user try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name" className="text-white">Team Name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="team-description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your team's purpose"
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamModal;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  onInviteMember: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onCreateTestInvitation?: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<string | null>;
  trigger?: React.ReactNode;
}

const InviteMemberModal = ({ onInviteMember, onCreateTestInvitation, trigger }: InviteMemberModalProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [testLink, setTestLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await onInviteMember(email.trim(), role);
      setEmail('');
      setRole('member');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestLink = async () => {
    if (!email.trim() || !onCreateTestInvitation) return;

    setLoading(true);
    try {
      const link = await onCreateTestInvitation(email.trim(), role);
      if (link) {
        setTestLink(link);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-white">Role</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'member' | 'viewer') => setRole(value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="viewer" className="text-white hover:bg-gray-700">Viewer - Can view projects and comments</SelectItem>
                <SelectItem value="member" className="text-white hover:bg-gray-700">Member - Can edit projects and tasks</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin - Can manage team and members</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {testLink && (
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4">
              <Label className="text-emerald-300 text-sm font-medium">Direct Invitation Link:</Label>
              <div className="mt-2 flex items-center space-x-2">
                <Input
                  value={testLink}
                  readOnly
                  className="bg-gray-800 border-gray-600 text-emerald-300 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(testLink)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Copy
                </Button>
              </div>
              <p className="text-emerald-400 text-xs mt-1">
                Share this link with {email} to join the team
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            
            {onCreateTestInvitation && (
              <Button
                type="button"
                disabled={loading || !email.trim()}
                onClick={handleCreateTestLink}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Generate Test Link'}
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;

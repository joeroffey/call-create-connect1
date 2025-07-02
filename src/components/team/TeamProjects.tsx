import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, Calendar, Users, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeamProjectsProps {
  teamId: string;
  members: any[];
}

const TeamProjects = ({ teamId, members }: TeamProjectsProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    label: ''
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchTeamProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_schedule_of_works(count)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching team projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProject.name.trim(),
          description: newProject.description.trim() || null,
          status: newProject.status,
          label: newProject.label.trim() || null,
          team_id: teamId,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Share the project with the team
      await supabase
        .from('team_projects')
        .insert([{
          project_id: data.id,
          team_id: teamId,
          shared_by: user.id
        }]);

      // Log team activity
      await supabase
        .from('team_activity')
        .insert([{
          team_id: teamId,
          user_id: user.id,
          action: 'project_created',
          target_type: 'project',
          target_id: data.id,
          metadata: { project_name: newProject.name }
        }]);

      toast({
        title: "Success",
        description: "Project created and shared with team",
      });

      setNewProject({ name: '', description: '', status: 'planning', label: '' });
      setCreateModalOpen(false);
      fetchTeamProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamProjects();
    }
  }, [teamId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'in-progress': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'on-hold': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'residential': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'commercial': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'renovation': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'new-build': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Team Projects</h3>
          <div className="animate-pulse bg-gray-700 h-10 w-32 rounded-lg"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-800 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Team Projects</h3>
        
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800/95 backdrop-blur-sm border-gray-600 max-w-md text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create Team Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="text-white">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="project-description" className="text-white">Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe the project"
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-status" className="text-white">Status</Label>
                  <Select value={newProject.status} onValueChange={(value) => setNewProject({ ...newProject, status: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="planning" className="text-white hover:bg-gray-700">Planning</SelectItem>
                      <SelectItem value="in-progress" className="text-white hover:bg-gray-700">In Progress</SelectItem>
                      <SelectItem value="on-hold" className="text-white hover:bg-gray-700">On Hold</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-gray-700">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project-label" className="text-white">Type</Label>
                  <Select value={newProject.label} onValueChange={(value) => setNewProject({ ...newProject, label: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="residential" className="text-white hover:bg-gray-700">Residential</SelectItem>
                      <SelectItem value="commercial" className="text-white hover:bg-gray-700">Commercial</SelectItem>
                      <SelectItem value="renovation" className="text-white hover:bg-gray-700">Renovation</SelectItem>
                      <SelectItem value="new-build" className="text-white hover:bg-gray-700">New Build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !newProject.name.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-300 mb-4">No team projects yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your first team project to start collaborating. Team projects are shared with all members.
          </p>
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {project.name}
                        </h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status.replace('-', ' ')}
                          </Badge>
                          {project.label && (
                            <Badge variant="outline" className={getLabelColor(project.label)}>
                              {project.label.replace('-', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {project.description && (
                        <p className="text-gray-400 mb-4">{project.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {members.length} members
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-medium">
                        {project.project_schedule_of_works?.[0]?.count || 0} tasks
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamProjects;
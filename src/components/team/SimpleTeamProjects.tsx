import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimpleTeamProjectsProps {
  teamId: string;
  members: any[];
}

const SimpleTeamProjects = ({ teamId, members }: SimpleTeamProjectsProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    label: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: ''
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchTeamProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get task counts for each project
      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project) => {
          const { data: taskCount } = await supabase
            .rpc('get_project_task_count', { project_id: project.id });
          return { ...project, taskCount: taskCount || 0 };
        })
      );
      
      setProjects(projectsWithCounts);
      
      // Auto-select first project if none selected
      if (projectsWithCounts.length > 0 && !selectedProject) {
        setSelectedProject(projectsWithCounts[0]);
        fetchProjectTasks(projectsWithCounts[0].id);
      }
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

  const fetchProjectTasks = async (projectId: string) => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('project_schedule_of_works')
        .select(`
          *,
          task_assignments(
            assigned_to,
            assigned_by,
            profiles:assigned_to(full_name)
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setNewProject({ name: '', description: '', status: 'planning', label: '' });
      setShowCreateProject(false);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !selectedProject) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: task, error: taskError } = await supabase
        .from('project_schedule_of_works')
        .insert([{
          title: newTask.title.trim(),
          project_id: selectedProject.id,
          user_id: user.id
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      // Assign task if assignee selected
      if (newTask.assignedTo && task) {
        await supabase
          .from('task_assignments')
          .insert([{
            task_id: task.id,
            team_id: teamId,
            assigned_to: newTask.assignedTo,
            assigned_by: user.id
          }]);
      }

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      setNewTask({ title: '', assignedTo: '' });
      setShowCreateTask(false);
      fetchProjectTasks(selectedProject.id);
      fetchTeamProjects(); // Refresh to update task counts
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .update({ 
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      if (selectedProject) {
        fetchProjectTasks(selectedProject.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

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

  useEffect(() => {
    if (teamId) {
      fetchTeamProjects();
    }
  }, [teamId]);

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
        <h3 className="text-2xl font-bold text-white">Team Projects & Schedule</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateProject(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          {selectedProject && (
            <Button 
              onClick={() => setShowCreateTask(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Create Project Form */}
      {showCreateProject && (
        <Card className="bg-gray-800/90 border-gray-700">
          <CardContent className="p-6">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">Create New Project</h4>
              
              <div>
                <Label htmlFor="project-name" className="text-white">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  className="bg-gray-700 border-gray-600 text-white"
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
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-status" className="text-white">Status</Label>
                  <Select value={newProject.status} onValueChange={(value) => setNewProject({ ...newProject, status: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                  onClick={() => setShowCreateProject(false)}
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
          </CardContent>
        </Card>
      )}

      {/* Create Task Form */}
      {showCreateTask && selectedProject && (
        <Card className="bg-gray-800/90 border-gray-700">
          <CardContent className="p-6">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-4">
                Create Task for "{selectedProject.name}"
              </h4>
              
              <div>
                <Label htmlFor="task-title" className="text-white">Task Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="task-assignee" className="text-white">Assign To</Label>
                <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="" className="text-white hover:bg-gray-700">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id} className="text-white hover:bg-gray-700">
                        {member.profiles?.full_name || 'Unknown User'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateTask(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !newTask.title.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-300 mb-4">No team projects yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your first team project to start collaborating and managing tasks.
          </p>
          <Button 
            onClick={() => setShowCreateProject(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Projects</h4>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group cursor-pointer ${
                  selectedProject?.id === project.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => {
                  setSelectedProject(project);
                  fetchProjectTasks(project.id);
                }}
              >
                <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {project.name}
                          </h5>
                          <div className="flex gap-1">
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
                          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {members.length}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-medium">
                          {project.taskCount || 0} tasks
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                {selectedProject ? `Tasks - ${selectedProject.name}` : 'Select a project'}
              </h4>
            </div>
            
            {selectedProject ? (
              <div className="space-y-3 max-h-96 overflow-auto">
                {tasks.map((task) => (
                  <Card key={task.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTaskComplete(task.id, task.completed)}
                            className={task.completed ? 'text-emerald-600' : 'text-gray-500'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <div>
                            <h6 className={`font-medium ${
                              task.completed ? 'line-through text-gray-500' : 'text-white'
                            }`}>
                              {task.title}
                            </h6>
                            {task.task_assignments?.[0] && (
                              <p className="text-sm text-gray-400">
                                Assigned to: {task.task_assignments[0].profiles?.full_name || 'Unknown'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks yet. Create one to get started!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a project to view its tasks</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTeamProjects;
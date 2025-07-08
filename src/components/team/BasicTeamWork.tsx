import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Clock, Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BasicTeamWorkProps {
  teamId: string;
  members: any[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  task_count?: number;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  project_id: string;
}

const BasicTeamWork = ({ teamId, members }: BasicTeamWorkProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load projects
  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
        return;
      }

      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project) => {
          try {
            const { count } = await supabase
              .from('project_schedule_of_works')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id);
            
            return { ...project, task_count: count || 0 };
          } catch (err) {
            console.error('Error getting task count for project:', project.id, err);
            return { ...project, task_count: 0 };
          }
        })
      );

      setProjects(projectsWithCounts);
      
      // Auto-select first project
      if (projectsWithCounts.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsWithCounts[0].id);
      }
    } catch (error) {
      console.error('Unexpected error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks for selected project
  const loadTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_schedule_of_works')
        .select('id, title, completed, created_at, project_id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Unexpected error loading tasks:', error);
    }
  };

  // Create project
  const createProject = async () => {
    if (!newProjectName.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProjectName.trim(),
          team_id: teamId,
          user_id: user.id
        }])
        .select('id, name, description, created_at')
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: 'Error',
          description: 'Failed to create project',
          variant: 'destructive',
        });
        return;
      }

      // Share with team
      await supabase
        .from('team_projects')
        .insert([{
          project_id: data.id,
          team_id: teamId,
          shared_by: user.id
        }]);

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      setNewProjectName('');
      setShowAddProject(false);
      loadProjects();
    } catch (error) {
      console.error('Unexpected error creating project:', error);
    } finally {
      setSaving(false);
    }
  };

  // Create task
  const createTask = async () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('project_schedule_of_works')
        .insert([{
          title: newTaskTitle.trim(),
          project_id: selectedProjectId,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: 'Error',
          description: 'Failed to create task',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });

      setNewTaskTitle('');
      setShowAddTask(false);
      loadTasks(selectedProjectId);
      loadProjects(); // Refresh to update task counts
    } catch (error) {
      console.error('Unexpected error creating task:', error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .update({ 
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      // Refresh tasks
      if (selectedProjectId) {
        loadTasks(selectedProjectId);
      }
    } catch (error) {
      console.error('Unexpected error updating task:', error);
    }
  };

  useEffect(() => {
    if (teamId) {
      loadProjects();
    }
  }, [teamId]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Team Work</h3>
        <Button 
          onClick={() => setShowAddProject(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Add Project Form */}
      {showAddProject && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Create New Project</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddProject(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-name" className="text-white">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="bg-gray-700 border-gray-600 text-white mt-1 mobile-input-focus"
                    onKeyPress={(e) => e.key === 'Enter' && createProject()}
                    onFocus={(e) => {
                      // Scroll input into view on mobile
                      if (window.innerWidth <= 768) {
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }
                    }}
                  />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddProject(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={createProject}
                disabled={saving || !newProjectName.trim()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {saving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <h4 className="text-xl text-white mb-2">No Projects Yet</h4>
            <p className="text-gray-400 mb-4">Create your first project to get started</p>
            <Button 
              onClick={() => setShowAddProject(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Projects</h4>
            {projects.map((project) => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-colors ${
                  selectedProjectId === project.id 
                    ? 'bg-emerald-900/50 border-emerald-500' 
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-white">{project.name}</h5>
                      {project.description && (
                        <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-medium">
                        {project.task_count || 0} tasks
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                {selectedProject ? `Tasks - ${selectedProject.name}` : 'Select a project'}
              </h4>
              {selectedProject && (
                <Button 
                  onClick={() => setShowAddTask(true)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              )}
            </div>

            {/* Add Task Form */}
            {showAddTask && selectedProject && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="task-title" className="text-white text-sm">New Task</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddTask(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    id="task-title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                    className="bg-gray-700 border-gray-600 text-white mobile-input-focus"
                    onKeyPress={(e) => e.key === 'Enter' && createTask()}
                    onFocus={(e) => {
                      // Scroll input into view on mobile
                      if (window.innerWidth <= 768) {
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }
                    }}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddTask(false)}
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createTask}
                      size="sm"
                      disabled={saving || !newTaskTitle.trim()}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {saving ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedProject ? (
              tasks.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="text-center py-6">
                    <p className="text-gray-400">No tasks yet</p>
                    <Button 
                      onClick={() => setShowAddTask(true)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add First Task
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <Card key={task.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTask(task.id, task.completed)}
                            className={`p-1 ${
                              task.completed ? 'text-emerald-500' : 'text-gray-500'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <div className="flex-1">
                            <span className={`text-sm ${
                              task.completed 
                                ? 'line-through text-gray-500' 
                                : 'text-white'
                            }`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(task.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-6">
                  <p className="text-gray-400">Select a project to view tasks</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicTeamWork;
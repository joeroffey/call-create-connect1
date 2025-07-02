import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateTaskModalProps {
  teamId: string;
  members: any[];
  onTaskCreated: () => void;
}

const CreateTaskModal = ({ teamId, members, onTaskCreated }: CreateTaskModalProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date>();
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTeamProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('team_id', teamId);

      if (error) throw error;
      setProjects(data || []);
      
      // Auto-select first project if available
      if (data && data.length > 0 && !projectId) {
        setProjectId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('project_schedule_of_works')
        .insert([{
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate?.toISOString().split('T')[0] || null,
          project_id: projectId,
          user_id: user.id
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      // If assigned to someone, create assignment
      if (assignedTo && task) {
        const { error: assignError } = await supabase
          .from('task_assignments')
          .insert([{
            task_id: task.id,
            team_id: teamId,
            assigned_to: assignedTo,
            assigned_by: user.id
          }]);

        if (assignError) throw assignError;
      }

      // Log team activity
      await supabase
        .from('team_activity')
        .insert([{
          team_id: teamId,
          user_id: user.id,
          action: 'task_created',
          target_type: 'task',
          target_id: task.id,
          metadata: { task_title: title, assigned_to: assignedTo }
        }]);

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate(undefined);
      setProjectId('');
      setOpen(false);
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeamProjects();
    }
  }, [open, teamId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md bg-white border-2 border-gray-400 shadow-2xl z-50" 
        style={{ backgroundColor: 'white', color: 'black' }}
      >
        <DialogHeader>
          <DialogTitle className="text-black text-xl font-semibold">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4">
          <div>
            <Label htmlFor="task-title" className="text-black font-medium">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="bg-white border-2 border-gray-400 text-black mt-1"
              style={{ backgroundColor: 'white', color: 'black' }}
              required
            />
          </div>

          <div>
            <Label htmlFor="task-description" className="text-black font-medium">Description (Optional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task"
              className="bg-white border-2 border-gray-400 text-black mt-1"
              style={{ backgroundColor: 'white', color: 'black' }}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="task-project" className="text-black font-medium">Project</Label>
            {projects.length === 0 ? (
              <div className="p-3 bg-red-100 border-2 border-red-300 rounded-md text-red-700 text-sm mt-1">
                No projects available. Create a project first to add tasks.
              </div>
            ) : (
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger className="bg-white border-2 border-gray-400 text-black mt-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-400 z-50">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="text-black hover:bg-gray-100">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="task-assignee" className="text-black font-medium">Assign To (Optional)</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="bg-white border-2 border-gray-400 text-black mt-1">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-400 z-50">
                <SelectItem value="" className="text-black hover:bg-gray-100">Unassigned</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id} className="text-black hover:bg-gray-100">
                    {member.profiles?.full_name || 'Unknown User'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-black font-medium">Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white border-2 border-gray-400 text-black hover:bg-gray-50 mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-2 border-gray-400 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="bg-white text-black"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2 pt-4 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-2 border-gray-400 text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !projectId || projects.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              style={{ backgroundColor: '#10b981', color: 'white' }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
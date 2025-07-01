import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Filter, Users, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateTaskModal from './CreateTaskModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  project_id: string;
  user_id: string;
  assigned_to?: string;
  assignee_profile?: {
    full_name: string;
  };
  creator_profile?: {
    full_name: string;
  };
}

interface TaskManagementProps {
  teamId: string;
  members: any[];
}

const TaskManagement = ({ teamId, members }: TaskManagementProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      // Get tasks from projects that belong to the team
      const { data: teamProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('team_id', teamId);

      if (!teamProjects || teamProjects.length === 0) {
        setTasks([]);
        return;
      }

      const projectIds = teamProjects.map(p => p.id);

      const { data: tasksData, error } = await supabase
        .from('project_schedule_of_works')
        .select(`
          *,
          task_assignments!left (
            assigned_to,
            assigned_by
          )
        `)
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for assigned users
      const userIds = [
        ...new Set([
          ...tasksData.map(t => t.user_id),
          ...tasksData.flatMap(t => t.task_assignments?.map(a => a.assigned_to) || [])
        ])
      ].filter(Boolean);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profilesMap = profiles?.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      const enrichedTasks = tasksData.map(task => ({
        ...task,
        assigned_to: task.task_assignments?.[0]?.assigned_to,
        assignee_profile: task.task_assignments?.[0]?.assigned_to 
          ? profilesMap[task.task_assignments[0].assigned_to]
          : null,
        creator_profile: profilesMap[task.user_id]
      }));

      setTasks(enrichedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              completed: !completed,
              completed_at: !completed ? new Date().toISOString() : null
            }
          : task
      ));

      toast({
        title: "Success",
        description: `Task ${!completed ? 'completed' : 'reopened'}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || 
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'overdue' && !task.completed && task.due_date && new Date(task.due_date) < new Date());

    const assigneeMatch = assigneeFilter === 'all' || 
      (assigneeFilter === 'unassigned' && !task.assigned_to) ||
      task.assigned_to === assigneeFilter;

    return statusMatch && assigneeMatch;
  });

  const getTaskStatus = (task: Task) => {
    if (task.completed) return 'completed';
    if (task.due_date && new Date(task.due_date) < new Date()) return 'overdue';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getPriorityColor = (dueDate?: string) => {
    if (!dueDate) return '';
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'text-red-400';
    if (days <= 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  useEffect(() => {
    fetchTasks();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-44 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map(member => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  {member.profiles?.full_name || 'Unknown User'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CreateTaskModal teamId={teamId} members={members} onTaskCreated={fetchTasks} />
      </div>

      {/* Tasks grid */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const status = getTaskStatus(task);
          return (
            <Card key={task.id} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskComplete(task.id, task.completed)}
                        className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                      />
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-3 ml-7">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 ml-7">
                      {task.due_date && (
                        <div className={`flex items-center gap-1 text-sm ${getPriorityColor(task.due_date)}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {task.assigned_to && task.assignee_profile && (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Users className="w-3 h-3" />
                          {task.assignee_profile.full_name}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        Created by {task.creator_profile?.full_name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={`${getStatusColor(status)} text-xs`}>
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
            <p className="text-sm">Create your first task to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
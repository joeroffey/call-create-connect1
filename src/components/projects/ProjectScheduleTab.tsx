import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, CheckSquare, Clock, User, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProjectSchedule } from '@/hooks/useProjectSchedule';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { formatDistanceToNow, format } from 'date-fns';

interface ProjectScheduleTabProps {
  project: any;
  user: any;
}

const ProjectScheduleTab = ({ project, user }: ProjectScheduleTabProps) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

  const scheduleHook = useProjectSchedule(project?.id, user?.id);
  const teamMembersHook = useTeamMembers(project?.team_id);

  const {
    scheduleItems,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  } = scheduleHook;

  const { members } = teamMembersHook;

  const getTaskAssignee = (assignedTo: string) => {
    if (!assignedTo) return 'Unassigned';
    if (assignedTo === user?.id) return 'Myself';
    
    const member = members?.find(m => m.user_id === assignedTo);
    return member?.profiles?.full_name || `User ${assignedTo.slice(0, 8)}`;
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        due_date: newTaskDueDate || undefined,
        assigned_to: newTaskAssignedTo || undefined
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskAssignedTo('');
      setShowAddTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) return;

    try {
      await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.due_date,
        assigned_to: editingTask.assigned_to
      });

      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Schedule of Works</h3>
          <p className="text-gray-400 text-sm">Manage project tasks and milestones</p>
        </div>
        <Button
          onClick={() => setShowAddTask(true)}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6"
        >
          <h4 className="font-medium text-white mb-4">Add New Task</h4>
          <div className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-gray-800/50 border-gray-700"
            />
            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="bg-gray-800/50 border-gray-700"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-gray-800/50 border-gray-700"
              />
              <Select value={newTaskAssignedTo} onValueChange={setNewTaskAssignedTo}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  <SelectItem value={user?.id}>Myself</SelectItem>
                  {members?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.profiles?.full_name || 'Team Member'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTask} className="bg-emerald-600 hover:bg-emerald-500">
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tasks List */}
      {scheduleItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create your first task to get started</p>
          <Button
            onClick={() => setShowAddTask(true)}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduleItems.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 bg-gray-900/50 backdrop-blur-sm border rounded-xl transition-all ${
                task.completed 
                  ? 'border-emerald-500/30 bg-emerald-900/20' 
                  : 'border-gray-800/50 hover:border-gray-700/50'
              }`}
            >
              {editingTask?.id === task.id ? (
                <div className="space-y-4">
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="bg-gray-800/50 border-gray-700"
                  />
                  <Textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="bg-gray-800/50 border-gray-700"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      value={editingTask.due_date || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      className="bg-gray-800/50 border-gray-700"
                    />
                    <Select
                      value={editingTask.assigned_to || ''}
                      onValueChange={(value) => setEditingTask({ ...editingTask, assigned_to: value })}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-700">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        <SelectItem value={user?.id}>Myself</SelectItem>
                        {members?.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.profiles?.full_name || 'Team Member'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleEditTask} size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingTask(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-600 hover:border-emerald-500'
                      }`}
                    >
                      {task.completed && <CheckSquare className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {task.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            <span>{getTaskAssignee(task.assigned_to)}</span>
                          </div>
                        )}
                        {task.completed && task.completed_at && (
                          <Badge variant="secondary" className="text-xs">
                            Completed {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectScheduleTab;
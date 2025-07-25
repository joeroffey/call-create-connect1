import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageCircle, 
  FileText, 
  CheckSquare, 
  Calendar,
  Plus,
  Clock,
  FolderOpen,
  Upload,
  Save,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Documents functionality moved to dedicated Documents page
import { useProjectSchedule } from '@/hooks/useProjectSchedule';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
  user: any;
  initialTab?: string;
  conversationsHook: any;
}

const ProjectDetailsModal = ({ 
  project, 
  isOpen, 
  onClose, 
  onStartNewChat, 
  user,
  initialTab = 'chats',
  conversationsHook
}: ProjectDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  // File input functionality moved to dedicated Documents page

  // Use dedicated hook for schedule
  const scheduleHook = useProjectSchedule(project?.id, user?.id);
  const teamMembersHook = useTeamMembers(project?.team_id);

  // Get task assignments for display
  const getTaskAssignee = (assignedTo: string) => {
    if (!assignedTo) return 'Unassigned';
    if (assignedTo === user?.id) return 'Myself';
    
    const member = teamMembersHook.members?.find(m => m.user_id === assignedTo);
    return member?.profiles?.full_name || `User ${assignedTo.slice(0, 8)}`;
  };

  const {
    conversations,
    getProjectConversationCount,
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount
  } = conversationsHook;

  // Filter conversations for this project
  const projectConversations = conversations.filter(
    (conv: any) => conv.project_id === project?.id
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleConversationClick = (conversationId: string) => {
    console.log('Opening conversation:', conversationId, 'for project:', project?.id);
    onStartNewChat(project?.id, conversationId);
    onClose();
  };

  const handleStartNewChat = () => {
    console.log('Starting new chat for project:', project?.id);
    onStartNewChat(project?.id);
    onClose();
  };

  // Documents functionality moved to dedicated Documents page

  // Task management functionality
  const handleAddTask = async () => {
    console.log('Creating task with data:', {
      title: newTaskTitle,
      description: newTaskDescription,
      due_date: newTaskDueDate,
      assigned_to: newTaskAssignedTo,
      project_id: project?.id,
      user_id: user?.id
    });
    
    if (!newTaskTitle.trim()) return;

    try {
      const success = await scheduleHook.createTask({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        due_date: newTaskDueDate || undefined,
        assigned_to: newTaskAssignedTo && newTaskAssignedTo !== 'unassigned' ? newTaskAssignedTo : undefined,
      });

      if (success) {
        console.log('Task created successfully');
        // Reset form and close
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskAssignedTo('');
        setShowAddTask(false);
        // Refresh project counts immediately
        if (conversationsHook.fetchProjectCounts) {
          conversationsHook.fetchProjectCounts();
        }
      } else {
        console.log('Task creation failed');
      }
    } catch (error) {
      console.error('Error in handleAddTask:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskDueDate(task.due_date || '');
    setNewTaskAssignedTo(task.assigned_to || 'unassigned');
    setShowEditTask(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !newTaskTitle.trim()) return;

    try {
      await scheduleHook.updateTask(editingTask.id, {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        due_date: newTaskDueDate || undefined,
        assigned_to: newTaskAssignedTo && newTaskAssignedTo !== 'unassigned' ? newTaskAssignedTo : undefined,
      });

      // Reset form and close
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskAssignedTo('');
      setShowEditTask(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-950/95 backdrop-blur-md border border-gray-800/50 rounded-2xl max-w-4xl w-full h-[80vh] shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-white truncate">{project.name}</h2>
                  <p className="text-gray-400 text-sm truncate">{project.description || 'No description'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Tabs Header */}
              <div className="px-6 pt-4 pb-2 border-b border-gray-800/30">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
                  <TabsTrigger value="chats" className="flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{getProjectConversationCount(project.id)}</span>
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center justify-center space-x-2">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{getProjectScheduleOfWorksCount(project.id)}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
                {/* Conversations Tab */}
                {activeTab === 'chats' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Project Conversations</h3>
                      <Button 
                        onClick={handleStartNewChat}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                    
                    {projectConversations.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-300 mb-2">No conversations yet</h4>
                          <p className="text-gray-500 mb-6">Start your first conversation about this project</p>
                          <Button 
                            onClick={handleStartNewChat}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Start New Chat
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {projectConversations.map((conversation: any) => (
                          <motion.div
                            key={conversation.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200"
                            onClick={() => handleConversationClick(conversation.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 pr-3">
                                <h4 className="font-medium text-white mb-1 truncate">
                                  {truncateText(conversation.title, 50)}
                                </h4>
                                <div className="flex items-center text-sm text-gray-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{formatDate(conversation.updated_at)}</span>
                                </div>
                              </div>
                              <MessageCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Documents functionality moved to dedicated Documents page */}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-lg font-semibold text-white">Schedule of Works</h3>
                      <Button 
                        onClick={() => setShowAddTask(true)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">

                    {/* Add Task Form */}
                    {showAddTask && (
                      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 mb-4">
                        <h4 className="text-white font-medium mb-3">Add New Task</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Task Title</label>
                            <Input
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="Enter task title..."
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Description (Optional)</label>
                            <Textarea
                              value={newTaskDescription}
                              onChange={(e) => setNewTaskDescription(e.target.value)}
                              placeholder="Enter task description..."
                              className="bg-gray-800 border-gray-700 text-white"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Due Date (Optional)</label>
                            <Input
                              type="date"
                              value={newTaskDueDate}
                              onChange={(e) => setNewTaskDueDate(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          {/* Only show assignment field for team projects */}
                          {project.team_id && (
                            <div>
                              <label className="text-sm font-medium text-white mb-1 block">Assign To (Optional)</label>
                              <Select value={newTaskAssignedTo} onValueChange={setNewTaskAssignedTo}>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                  <SelectValue placeholder="Select team member..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  <SelectItem value={user?.id}>Myself</SelectItem>
                                  {teamMembersHook.members?.filter(member => member.user_id !== user?.id).map((member) => (
                                    <SelectItem key={member.user_id} value={member.user_id}>
                                      {member.profiles?.full_name || `User ${member.user_id.slice(0, 8)}`}
                                    </SelectItem>
                                  )) || []}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={handleAddTask}
                              disabled={!newTaskTitle.trim() || scheduleHook.saving}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {scheduleHook.saving ? 'Creating...' : 'Create Task'}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowAddTask(false);
                                setNewTaskTitle('');
                                setNewTaskDescription('');
                                setNewTaskDueDate('');
                                setNewTaskAssignedTo('');
                              }}
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Task Form */}
                    {showEditTask && editingTask && (
                      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 mb-4">
                        <h4 className="text-white font-medium mb-3">Edit Task</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Task Title</label>
                            <Input
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="Enter task title..."
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Description (Optional)</label>
                            <Textarea
                              value={newTaskDescription}
                              onChange={(e) => setNewTaskDescription(e.target.value)}
                              placeholder="Enter task description..."
                              className="bg-gray-800 border-gray-700 text-white"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white mb-1 block">Due Date (Optional)</label>
                            <Input
                              type="date"
                              value={newTaskDueDate}
                              onChange={(e) => setNewTaskDueDate(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          {/* Only show assignment field for team projects */}
                          {project.team_id && (
                            <div>
                              <label className="text-sm font-medium text-white mb-1 block">Assign To (Optional)</label>
                              <Select value={newTaskAssignedTo} onValueChange={setNewTaskAssignedTo}>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                  <SelectValue placeholder="Select team member..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  <SelectItem value={user?.id}>Myself</SelectItem>
                                  {teamMembersHook.members?.filter(member => member.user_id !== user?.id).map((member) => (
                                    <SelectItem key={member.user_id} value={member.user_id}>
                                      {member.profiles?.full_name || `User ${member.user_id.slice(0, 8)}`}
                                    </SelectItem>
                                  )) || []}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={handleUpdateTask}
                              disabled={!newTaskTitle.trim() || scheduleHook.saving}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {scheduleHook.saving ? 'Updating...' : 'Update Task'}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowEditTask(false);
                                setEditingTask(null);
                                setNewTaskTitle('');
                                setNewTaskDescription('');
                                setNewTaskDueDate('');
                                setNewTaskAssignedTo('');
                              }}
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {scheduleHook.scheduleItems.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-300 mb-2">No schedule items</h4>
                          <p className="text-gray-500 mb-6">Create tasks to organize your project timeline</p>
                          <Button 
                            onClick={() => setShowAddTask(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Task
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-3 max-h-96 custom-scrollbar">
                        {scheduleHook.scheduleItems.map((item: any) => (
                          <div 
                            key={item.id} 
                            className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                            onClick={() => handleEditTask(item)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scheduleHook.toggleTaskCompletion(item.id, item.completed);
                                    }}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      item.completed 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'border-gray-500 hover:border-green-500'
                                    } transition-colors cursor-pointer`}
                                  >
                                    {item.completed && <CheckSquare className="w-3 h-3 text-white" />}
                                  </button>
                                  <h4 className={`font-medium truncate ${
                                    item.completed ? 'text-gray-400 line-through' : 'text-white'
                                  }`}>
                                    {item.title}
                                  </h4>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-400 mt-1 line-clamp-2 ml-7">{item.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 ml-7">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>Created: {formatCreatedDate(item.created_at)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>Due: {item.due_date ? formatDueDate(item.due_date) : 'No due date'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    <span>{getTaskAssignee(item.assigned_to)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </div>

          {/* Footer - Fixed Position */}
          <div className="flex-shrink-0 p-4 border-t border-gray-800/50 bg-gray-950/95">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Status: <span className="text-white">{project.status}</span></span>
                <span>Label: <span className="text-white">{project.label}</span></span>
              </div>
              <span>Updated: <span className="text-white">{formatDate(project.updated_at)}</span></span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* File input and documents functionality moved to dedicated Documents page */}
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Calendar, 
  Users, 
  MessageSquare, 
  Upload, 
  FileText, 
  CheckCircle2,
  Clock,
  User,
  Bot,
  Send,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeamProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  teamMembers: any[];
  teamId: string;
}

const TeamProjectDetailsModal = ({ isOpen, onClose, project, teamMembers, teamId }: TeamProjectDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();

  const fetchProjectData = async () => {
    if (!project?.id) return;
    
    setLoading(true);
    try {
      // Fetch tasks
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
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

      // Initialize chat messages
      setChatMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm here to help you with the ${project.name} project. You can ask me about building regulations, project planning, material calculations, or any other construction-related questions.`,
          timestamp: new Date()
        }
      ]);

    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: task, error: taskError } = await supabase
        .from('project_schedule_of_works')
        .insert([{
          title: newTaskTitle.trim(),
          project_id: project.id,
          user_id: user.id
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      // Assign task if assignee selected
      if (newTaskAssignee && task) {
        await supabase
          .from('task_assignments')
          .insert([{
            task_id: task.id,
            team_id: teamId,
            assigned_to: newTaskAssignee,
            assigned_by: user.id
          }]);
      }

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      setNewTaskTitle('');
      setNewTaskAssignee('');
      fetchProjectData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
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
      fetchProjectData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${messageContent}". For the ${project.name} project, I'd be happy to help you with building regulations, planning requirements, material specifications, or project timeline guidance. Could you provide more specific details about what you'd like to know?`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${project.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      await supabase
        .from('project_documents')
        .insert([{
          project_id: project.id,
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size
        }]);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      fetchProjectData();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    if (isOpen && project) {
      fetchProjectData();
    }
  }, [isOpen, project]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'on-hold': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{project?.name}</h2>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(project?.status)}>
                    {project?.status?.replace('-', ' ')}
                  </Badge>
                  {project?.label && (
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      {project.label.replace('-', ' ')}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Users className="w-4 h-4" />
                    {teamMembers.length} members
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(project?.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {project?.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 mx-6 mt-4 rounded-lg">
                <TabsTrigger value="tasks" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <div className="p-6 h-[calc(100%-120px)] overflow-auto">
                <TabsContent value="tasks" className="space-y-4 mt-0">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Add new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && createTask()}
                    />
                    <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.profiles?.full_name || 'Unknown User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={createTask} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-auto">
                    {tasks.map((task) => (
                      <Card key={task.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTaskComplete(task.id, task.completed)}
                                className={task.completed ? 'text-green-600' : 'text-gray-400'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <div>
                                <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                                {task.task_assignments?.[0] && (
                                  <p className="text-sm text-gray-600">
                                    Assigned to: {task.task_assignments[0].profiles?.full_name || 'Unknown'}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {new Date(task.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="flex flex-col h-full mt-0">
                  <div className="flex-1 border border-gray-200 rounded-lg p-4 mb-4 max-h-96 overflow-auto bg-gray-50">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                            }`}>
                              {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`p-3 rounded-lg ${
                              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask AI about your project..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 mt-0">
                  <div className="flex gap-4">
                    <Button
                      onClick={() => document.getElementById('document-upload')?.click()}
                      disabled={uploadingFile}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFile ? 'Uploading...' : 'Upload Document'}
                    </Button>
                    <input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-auto">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-600" />
                              <div>
                                <h4 className="font-medium text-gray-900">{doc.file_name}</h4>
                                <p className="text-sm text-gray-600">
                                  {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamProjectDetailsModal;
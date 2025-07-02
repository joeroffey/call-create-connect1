import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  teamMembers: any[];
  teamId: string;
}

const ProjectDetailsModal = ({ isOpen, onClose, project, teamMembers, teamId }: ProjectDetailsModalProps) => {
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

      // Initialize chat messages (would come from a separate table in real implementation)
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
    setNewMessage('');

    // Simulate AI response (in real implementation, this would call an AI service)
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${newMessage}". For the ${project.name} project, I'd be happy to help you with building regulations, planning requirements, material specifications, or project timeline guidance. Could you provide more specific details about what you'd like to know?`,
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

      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(fileName);

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
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'in-progress': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'on-hold': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white border-gray-300 text-gray-900 p-0 shadow-2xl">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl text-gray-900 mb-2">{project?.name}</DialogTitle>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getStatusColor(project?.status)}>
                  {project?.status?.replace('-', ' ')}
                </Badge>
                {project?.label && (
                  <Badge variant="outline" className="border-gray-400 text-gray-700">
                    {project.label.replace('-', ' ')}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Users className="w-4 h-4" />
                  {teamMembers.length} members
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(project?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {project?.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 mx-6 mt-4">
              <TabsTrigger value="tasks" className="text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden p-6">
              <TabsContent value="tasks" className="h-full space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Add new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && createTask()}
                  />
                  <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                    <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="" className="text-gray-900">Unassigned</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id} className="text-gray-900">
                          {member.profiles?.full_name || 'Unknown User'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={createTask} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Card key={task.id} className="bg-gray-50 border-gray-200">
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
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {new Date(task.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat" className="h-full flex flex-col">
                <ScrollArea className="flex-1 h-[400px] border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}>
                            {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-900'
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
                </ScrollArea>
                
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Ask AI about your project..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="h-full space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={() => document.getElementById('document-upload')?.click()}
                    disabled={uploadingFile}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
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

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="bg-gray-50 border-gray-200">
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
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;
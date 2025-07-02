
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
  User,
  FolderOpen,
  Upload,
  Save,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [documents, setDocuments] = useState<any[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    if (isOpen && project) {
      fetchProjectDetails();
    }
  }, [isOpen, project?.id]);

  const fetchProjectDetails = async () => {
    if (!project?.id || !user?.id) return;
    
    setLoading(true);
    try {
      // Fetch documents - RLS will handle access control
      const { data: docsData, error: docsError } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // Fetch schedule of works - RLS will handle access control
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('project_schedule_of_works')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (scheduleError) throw scheduleError;
      setScheduleItems(scheduleData || []);

    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        variant: "destructive",
        title: "Error loading project details",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Document upload functionality
  const handleDocumentUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadDocument = async (file: File) => {
    if (!project?.id || !user?.id) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Project and user information required for document upload.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const filePath = `${user.id}/${project.id}/${Date.now()}-${file.name}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { error: dbError } = await supabase
        .from('project_documents')
        .insert([
          {
            project_id: project.id,
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          }
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded to your project.`,
      });

      // Refresh documents list
      fetchProjectDetails();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if it's a supported file type
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv', 'application/json', 'application/xml'
      ];
      
      if (!supportedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: "Please upload images, PDFs, Word documents, or text files.",
        });
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 50MB.",
        });
        return;
      }

      uploadDocument(file);
    }
  };

  // Task management functionality
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !project?.id || !user?.id) return;

    setSavingTask(true);
    try {
      const taskData: any = {
        title: newTaskTitle.trim(),
        project_id: project.id,
        user_id: user.id
      };

      if (newTaskDescription.trim()) {
        taskData.description = newTaskDescription.trim();
      }

      if (newTaskDueDate) {
        taskData.due_date = newTaskDueDate;
      }

      const { error } = await supabase
        .from('project_schedule_of_works')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });

      // Reset form and close
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setShowAddTask(false);
      
      // Refresh schedule items
      fetchProjectDetails();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setSavingTask(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .update({ 
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      // Refresh schedule items
      fetchProjectDetails();
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
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

          {/* Content Area - Fixed Height Management */}
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              {/* Tabs Header */}
              <div className="px-6 pt-4 pb-2 flex-shrink-0">
                <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
                  <TabsTrigger value="chats" className="flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{getProjectConversationCount(project.id)}</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{getProjectDocumentCount(project.id)}</span>
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center justify-center space-x-2">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{getProjectScheduleOfWorksCount(project.id)}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content - Flexible Height */}
              <div className="flex-1 px-6 pb-6 min-h-0 overflow-hidden">
                <TabsContent value="chats" className="h-full flex flex-col m-0">
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
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
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
                </TabsContent>

                <TabsContent value="documents" className="h-full flex flex-col m-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Project Documents</h3>
                    <Button 
                      onClick={handleDocumentUpload}
                      disabled={isUploading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      <Upload className={`w-4 h-4 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                  {documents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-300 mb-2">No documents uploaded</h4>
                        <p className="text-gray-500 mb-6">Upload documents to share them with your project team</p>
                        <Button 
                          onClick={handleDocumentUpload}
                          disabled={isUploading}
                          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        >
                          <Upload className={`w-4 h-4 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
                          {isUploading ? 'Uploading...' : 'Upload First Document'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-white truncate">{doc.file_name}</h4>
                              <p className="text-sm text-gray-400">
                                {(doc.file_size / 1024).toFixed(1)} KB • {formatDate(doc.created_at)}
                              </p>
                            </div>
                            <FileText className="w-5 h-5 text-blue-400 ml-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="schedule" className="h-full flex flex-col m-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Schedule of Works</h3>
                    <Button 
                      onClick={() => setShowAddTask(true)}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>

                  {/* Add Task Form */}
                  {showAddTask && (
                    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 mb-4">
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
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleAddTask}
                            disabled={!newTaskTitle.trim() || savingTask}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {savingTask ? 'Creating...' : 'Create Task'}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowAddTask(false);
                              setNewTaskTitle('');
                              setNewTaskDescription('');
                              setNewTaskDueDate('');
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
                  {scheduleItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-300 mb-2">No schedule items</h4>
                        <p className="text-gray-500 mb-6">Create tasks to organize your project timeline</p>
                        <Button 
                          onClick={() => setShowAddTask(true)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Task
                        </Button>
                      </div>
                    </div>
                  ) : (
                     <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                       {scheduleItems.map((item: any) => (
                         <div key={item.id} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                           <div className="flex items-start justify-between">
                             <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => toggleTaskCompletion(item.id, item.completed)}
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
                               <div className="flex items-center mt-2 text-sm text-gray-500 ml-7">
                                 <Calendar className="w-3 h-3 mr-1" />
                                 <span>
                                   {item.due_date ? formatDate(item.due_date) : 'No due date'}
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                  )}
                </TabsContent>
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

      {/* Hidden file input for document upload */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.xml"
      />
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;

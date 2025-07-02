
import React, { useState, useEffect } from 'react';
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
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          className="bg-gray-950/95 backdrop-blur-md border border-gray-800/50 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800/50">
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

          {/* Content Area - Fixed Height Container */}
          <div className="flex flex-col h-[calc(90vh-200px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              {/* Tabs Header */}
              <div className="px-6 pt-4 pb-2">
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

              {/* Tab Content - Scrollable Area */}
              <div className="flex-1 px-6 pb-4 min-h-0">
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
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                  {documents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-300 mb-2">No documents uploaded</h4>
                        <p className="text-gray-500 mb-6">Upload documents to share them with your project team</p>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Upload First Document
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
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  {scheduleItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-300 mb-2">No schedule items</h4>
                        <p className="text-gray-500 mb-6">Create tasks to organize your project timeline</p>
                        <Button 
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
                              <h4 className="font-medium text-white truncate">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                              )}
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>
                                  {item.due_date ? formatDate(item.due_date) : 'No due date'}
                                </span>
                              </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ml-3 ${
                              item.completed ? 'bg-green-500' : 'bg-gray-600'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800/50 bg-gray-950/95">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Status: <span className="text-white">{project.status}</span></span>
                <span>Label: <span className="text-white">{project.label}</span></span>
              </div>
              <span>Last updated: <span className="text-white">{formatDate(project.updated_at)}</span></span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;

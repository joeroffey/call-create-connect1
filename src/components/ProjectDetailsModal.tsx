import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, FileText, Milestone, Plus, Calendar, Upload, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useConversations } from '../hooks/useConversations';

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onStartNewChat: (projectId: string) => void;
  onSelectConversation?: (conversationId: string) => void;
  user: any;
  initialTab?: string;
}

const ProjectDetailsModal = ({ project, isOpen, onClose, onStartNewChat, onSelectConversation, user, initialTab = 'chats' }: ProjectDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [documents, setDocuments] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' });
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { conversations, getProjectConversationCount } = useConversations(user?.id);
  
  // Filter conversations for this project
  const projectConversations = conversations.filter(conv => conv.project_id === project?.id);

  // Update activeTab when initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && project) {
      fetchDocuments();
      fetchMilestones();
    }
  }, [isOpen, project]);

  const fetchDocuments = async () => {
    if (!project?.id || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchMilestones = async () => {
    if (!project?.id || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const createMilestone = async () => {
    if (!newMilestone.title.trim() || !project?.id || !user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_milestones')
        .insert([
          {
            project_id: project.id,
            user_id: user.id,
            title: newMilestone.title.trim(),
            description: newMilestone.description.trim() || null,
            due_date: newMilestone.due_date || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Milestone created",
        description: `${newMilestone.title} has been added to your project.`,
      });

      setNewMilestone({ title: '', description: '', due_date: '' });
      setShowAddMilestone(false);
      fetchMilestones();
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      toast({
        variant: "destructive",
        title: "Error creating milestone",
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ completed: !completed })
        .eq('id', milestoneId);

      if (error) throw error;
      fetchMilestones();
    } catch (error: any) {
      console.error('Error updating milestone:', error);
      toast({
        variant: "destructive",
        title: "Error updating milestone",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !project?.id || !user?.id) return;

    const file = files[0];
    
    // Check file type and size
    const supportedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'text/markdown'
    ];

    if (!supportedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image, PDF, Word document, or text file.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
      });
      return;
    }

    setLoading(true);
    try {
      const filePath = `${user.id}/${project.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });

      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document.",
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleConversationClick = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800/30 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{project?.name}</h2>
              <p className="text-gray-400 text-sm">{project?.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-800/30">
            <div className="flex space-x-0">
              {[
                { id: 'chats', label: 'Chats', icon: MessageCircle, count: projectConversations.length },
                { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
                { id: 'milestones', label: 'Milestones', icon: Milestone, count: milestones.length },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5'
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'chats' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Project Conversations</h3>
                  <button
                    onClick={() => {
                      onStartNewChat(project.id);
                      onClose();
                    }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Start New Chat
                  </button>
                </div>
                
                {projectConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No conversations yet</p>
                    <p className="text-gray-500 text-sm">Start a chat to discuss this project</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-emerald-500/30 transition-colors cursor-pointer group"
                      >
                        <h4 className="text-white font-medium mb-1 group-hover:text-emerald-300">{conversation.title}</h4>
                        <p className="text-gray-400 text-sm">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Project Documents</h3>
                  <label className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Document
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.txt,.csv,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No documents uploaded yet</p>
                    <p className="text-gray-500 text-sm">Upload documents to share with the AI</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <h4 className="text-white font-medium">{doc.file_name}</h4>
                            <p className="text-gray-400 text-sm">
                              {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Project Milestones</h3>
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Milestone
                  </button>
                </div>

                {showAddMilestone && (
                  <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 space-y-3">
                    <input
                      type="text"
                      placeholder="Milestone title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none resize-none"
                    />
                    <input
                      type="date"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-emerald-500/60 focus:outline-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={createMilestone}
                        disabled={!newMilestone.title.trim() || loading}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowAddMilestone(false)}
                        className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {milestones.length === 0 ? (
                  <div className="text-center py-8">
                    <Milestone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No milestones created yet</p>
                    <p className="text-gray-500 text-sm">Add milestones to track project progress</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-start space-x-3"
                      >
                        <button
                          onClick={() => toggleMilestone(milestone.id, milestone.completed)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            milestone.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-600 hover:border-emerald-500'
                          }`}
                        >
                          {milestone.completed && '✓'}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-medium ${milestone.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-gray-400 text-sm mt-1">{milestone.description}</p>
                          )}
                          {milestone.due_date && (
                            <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;

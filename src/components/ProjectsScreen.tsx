import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Calendar, MessageCircle, FileText, Milestone, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConversations } from '../hooks/useConversations';
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsModal from './ProjectDetailsModal';

interface Project {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ProjectsScreenProps {
  user: any;
  onStartNewChat: (projectId: string, conversationId: string) => void;
}

const ProjectsScreen = ({ user, onStartNewChat }: ProjectsScreenProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', label: 'Residential' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const { toast } = useToast();
  
  // Get conversations data with the new helper functions
  const { 
    conversations, 
    getProjectConversationCount, 
    getProjectDocumentCount,
    getProjectMilestoneCount,
    loading: conversationsLoading 
  } = useConversations(user?.id);

  console.log('ProjectsScreen - conversations loaded:', conversations.length);
  console.log('ProjectsScreen - conversations:', conversations);

  const fetchProjects = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      console.log('ProjectsScreen - fetched projects:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading projects",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  // Set up real-time subscription for projects
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Project change detected:', payload);
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const createProject = async () => {
    if (!user?.id || !newProject.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: newProject.name.trim(),
            description: newProject.description.trim() || null,
            label: newProject.label,
            status: 'planning'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project created successfully",
        description: `${newProject.name} has been added to your projects.`,
      });

      setNewProject({ name: '', description: '', label: 'Residential' });
      setShowCreateModal(false);
      fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const updateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name.trim(),
          description: editingProject.description.trim() || null,
          label: editingProject.label,
          status: editingProject.status
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      toast({
        title: "Project updated successfully",
        description: `${editingProject.name} has been updated.`,
      });

      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated conversations and documents.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: `${projectName} has been deleted.`,
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error deleting project",
        description: error.message || "Please try again.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'on-hold': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Residential': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Commercial': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Industrial': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Infrastructure': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleProjectStatsClick = (project: Project, section: string) => {
    setSelectedProject(project);
    setActiveTab(section);
    setShowProjectDetails(true);
  };

  const handleOpenProjectChat = (projectId: string, conversationId: string) => {
    // Start the project chat with the specific conversation
    onStartNewChat(projectId, conversationId);
  };

  if (loading || conversationsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">Manage your building regulation projects</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </motion.button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <FolderOpen className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started with building regulations guidance.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              Create Project
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const conversationCount = getProjectConversationCount(project.id);
              const documentCount = getProjectDocumentCount(project.id);
              const milestoneCount = getProjectMilestoneCount(project.id);
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 hover:border-emerald-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Label */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLabelColor(project.label)}`}>
                      {project.label}
                    </span>
                  </div>

                  {/* Stats - Now properly routing to correct sections */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-gray-800/30">
                    <button
                      onClick={() => handleProjectStatsClick(project, 'chats')}
                      className="text-center hover:bg-gray-800/30 rounded-lg p-2 transition-colors group/stat"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="w-4 h-4 text-emerald-400 group-hover/stat:text-emerald-300" />
                      </div>
                      <div className="text-lg font-semibold text-white group-hover/stat:text-emerald-300">{conversationCount}</div>
                      <div className="text-xs text-gray-400">Chats</div>
                    </button>
                    <button
                      onClick={() => handleProjectStatsClick(project, 'documents')}
                      className="text-center hover:bg-gray-800/30 rounded-lg p-2 transition-colors group/stat"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <FileText className="w-4 h-4 text-blue-400 group-hover/stat:text-blue-300" />
                      </div>
                      <div className="text-lg font-semibold text-white group-hover/stat:text-blue-300">{documentCount}</div>
                      <div className="text-xs text-gray-400">Docs</div>
                    </button>
                    <button
                      onClick={() => handleProjectStatsClick(project, 'milestones')}
                      className="text-center hover:bg-gray-800/30 rounded-lg p-2 transition-colors group/stat"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Milestone className="w-4 h-4 text-purple-400 group-hover/stat:text-purple-300" />
                      </div>
                      <div className="text-lg font-semibold text-white group-hover/stat:text-purple-300">{milestoneCount}</div>
                      <div className="text-xs text-gray-400">Milestones</div>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onStartNewChat(project.id)}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      Start Chat
                    </button>
                    <button
                      onClick={() => setEditingProject(project)}
                      className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id, project.name)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Project dates */}
                  <div className="mt-4 pt-3 border-t border-gray-800/30 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={showProjectDetails}
        onClose={() => {
          setShowProjectDetails(false);
          setSelectedProject(null);
        }}
        onStartNewChat={onStartNewChat}
        user={user}
        initialTab={activeTab}
        onOpenChat={handleOpenProjectChat}
      />

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-white mb-6">Create New Project</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Describe your project"
                  />
                </div>

                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <select
                    id="label"
                    value={newProject.label}
                    onChange={(e) => setNewProject({ ...newProject, label: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProject.name.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setEditingProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit Project</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Describe your project"
                  />
                </div>

                <div>
                  <label htmlFor="edit-label" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <select
                    id="edit-label"
                    value={editingProject.label}
                    onChange={(e) => setEditingProject({ ...editingProject, label: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingProject(null)}
                  className="flex-1 px-4 py-2 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProject}
                  disabled={!editingProject.name.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsScreen;

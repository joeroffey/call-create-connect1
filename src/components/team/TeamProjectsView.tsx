import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConversations } from '../../hooks/useConversations';
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsModal from '../ProjectDetailsModal';
import ProjectCard from '../projects/ProjectCard';
import CreateProjectModal from '../projects/CreateProjectModal';
import EditProjectModal from '../projects/EditProjectModal';
import EmptyProjectsState from '../projects/EmptyProjectsState';
import ProjectFiltersComponent, { ProjectFilters } from '../projects/ProjectFilters';

interface TeamProject {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
  team_id: string;
  team_name: string;
}

interface TeamProjectsViewProps {
  user: any;
  teamId: string;
  teamName: string;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
}

const TeamProjectsView = ({ user, teamId, teamName, onStartNewChat }: TeamProjectsViewProps) => {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', label: 'Residential' });
  const [editingProject, setEditingProject] = useState<TeamProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<TeamProject | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [filters, setFilters] = useState<ProjectFilters>({
    context: 'all',
    projectType: 'all',
    status: 'all',
    search: ''
  });
  const { toast } = useToast();
  
  // Early return if required props are missing
  if (!user || !teamId || !teamName) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white">Loading team information...</div>
      </div>
    );
  }
  
  // Get conversations data with the new helper functions
  const conversationsHook = useConversations(user.id);
  const { 
    conversations, 
    getProjectConversationCount, 
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount,
    loading: conversationsLoading,
    incrementDocumentCount,
    incrementScheduleCount
  } = conversationsHook;

  
  const fetchTeamProjects = async () => {
    if (!user?.id || !teamId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('team_id', teamId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // Process projects to include team name
      const processedProjects = (data || []).map(project => ({
        ...project,
        team_name: teamName
      }));
      
      // Sort projects: pinned first, then by updated_at
      const sortedProjects = processedProjects.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setProjects(sortedProjects);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading team projects",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamProjects();
  }, [user?.id, teamId]);

  // Set up real-time subscription for team projects
  useEffect(() => {
    if (!user?.id || !teamId) return;

    const channel = supabase
      .channel('team-projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchTeamProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, teamId]);

  const togglePinProject = async (projectId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ pinned: !currentPinned })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: !currentPinned ? "Project pinned" : "Project unpinned",
        description: !currentPinned ? "Project moved to top of list" : "Project unpinned from top",
      });

      fetchTeamProjects();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      const statusLabel = newStatus === 'setup' ? 'Set-up' : newStatus.replace('-', ' ');
      toast({
        title: "Status updated",
        description: `Project status changed to ${statusLabel}.`,
      });

      fetchTeamProjects();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message || "Please try again.",
      });
    }
  };

  const createProject = async () => {
    if (!user?.id || !newProject.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            team_id: teamId,
            name: newProject.name.trim(),
            description: newProject.description.trim() || null,
            label: newProject.label,
            status: 'setup'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Team project created successfully",
        description: `${newProject.name} has been added to ${teamName}.`,
      });

      setNewProject({ name: '', description: '', label: 'Residential' });
      setShowCreateModal(false);
      fetchTeamProjects();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const updateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) {
      return;
    }

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

      if (error) {
        throw error;
      }

      toast({
        title: "Project updated successfully",
        description: `${editingProject.name} has been updated.`,
      });

      setEditingProject(null);
      fetchTeamProjects();
    } catch (error: any) {
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

      fetchTeamProjects();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting project",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleProjectStatsClick = (project: TeamProject, section: string) => {
    setSelectedProject(project);
    setActiveTab(section);
    setShowProjectDetails(true);
  };

  const handleEditProject = (project: any) => {
    const teamProject: TeamProject = {
      ...project,
      team_id: project.team_id || teamId,
      team_name: project.team_name || teamName
    };
    setEditingProject(teamProject);
  };

  const handleStartNewChatFromModal = (projectId: string, conversationId?: string) => {
    if (conversationId) {
      onStartNewChat(projectId, conversationId);
    } else {
      onStartNewChat(projectId);
    }
  };

  if (loading || conversationsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!projects) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }

  // Simplified filtering to prevent crashes
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    try {
      return projects.filter(project => {
        // Project type filter
        if (filters.projectType && filters.projectType !== 'all' && project.label !== filters.projectType) {
          return false;
        }
        
        // Status filter  
        if (filters.status && filters.status !== 'all' && project.status !== filters.status) {
          return false;
        }
        
        // Search filter
        if (filters.search && filters.search.trim()) {
          const searchLower = filters.search.toLowerCase();
          const nameMatch = project.name && project.name.toLowerCase().includes(searchLower);
          const descriptionMatch = project.description && project.description.toLowerCase().includes(searchLower);
          if (!nameMatch && !descriptionMatch) {
            return false;
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering projects:', error);
      return projects;
    }
  }, [projects, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Team Projects</h3>
          <p className="text-gray-400 mt-1">Collaborate on building regulation projects with {teamName}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Team Project</span>
        </motion.button>
      </div>

      {/* Project Filters */}
      <ProjectFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        showContextFilter={false}
        projectCount={filteredProjects.length}
      />

      {/* Projects Grid */}
      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No team projects yet</h3>
            <p className="text-sm text-gray-400 mb-6">Create your first team project to start collaborating</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Team Project</span>
            </motion.button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
            <h3 className="text-lg font-medium text-gray-300 mb-2">No team projects match your filters</h3>
            <p className="text-sm text-gray-400">Try adjusting your filter criteria or clearing all filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              try {
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    conversationCount={getProjectConversationCount(project.id) || 0}
                    documentCount={getProjectDocumentCount(project.id) || 0}
                    scheduleOfWorksCount={getProjectScheduleOfWorksCount(project.id) || 0}
                    onStartNewChat={onStartNewChat}
                    onEdit={handleEditProject}
                    onDelete={deleteProject}
                    onTogglePin={togglePinProject}
                    onProjectStatsClick={handleProjectStatsClick}
                    onStatusChange={handleStatusChange}
                  />
                );
              } catch (error) {
                console.error('Error rendering project card:', error, project);
                return null;
              }
            })}
          </div>
        )}
      </div>

      {/* Project Details Modal - Pass the shared hook */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={showProjectDetails}
        onClose={() => {
          setShowProjectDetails(false);
          setSelectedProject(null);
        }}
        onStartNewChat={handleStartNewChatFromModal}
        user={user}
        initialTab={activeTab}
        conversationsHook={conversationsHook}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newProject={newProject}
        setNewProject={setNewProject}
        onCreateProject={createProject}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        editingProject={editingProject}
        onClose={() => setEditingProject(null)}
        setEditingProject={(project) => {
          if (project) {
            const teamProject: TeamProject = {
              ...project,
              team_id: (project as any).team_id || teamId,
              team_name: (project as any).team_name || teamName
            };
            setEditingProject(teamProject);
          } else {
            setEditingProject(null);
          }
        }}
        onUpdateProject={updateProject}
      />
    </div>
  );
};

export default TeamProjectsView;
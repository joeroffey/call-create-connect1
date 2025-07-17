
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConversations } from '../hooks/useConversations';
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectCard from './projects/ProjectCard';
import CreateProjectModal from './projects/CreateProjectModal';
import EditProjectModal from './projects/EditProjectModal';
import EmptyProjectsState from './projects/EmptyProjectsState';
import ProjectFiltersComponent, { ProjectFilters } from './projects/ProjectFilters';

interface Project {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
  team_id?: string;
  team_name?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
}

interface ProjectsScreenProps {
  user: any;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
  pendingProjectModal?: {projectId: string, view: string} | null;
  onProjectModalHandled?: () => void;
  workspaceContext?: 'personal' | 'team' | 'all'; // New prop to filter projects
}

const ProjectsScreen = ({ user, onStartNewChat, pendingProjectModal, onProjectModalHandled, workspaceContext = 'all' }: ProjectsScreenProps) => {
  console.log('ProjectsScreen: Component starting to render');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    label: 'Residential',
    customer_name: '',
    customer_address: '',
    customer_phone: ''
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [filters, setFilters] = useState<ProjectFilters>({
    context: workspaceContext === 'personal' ? 'personal' : workspaceContext === 'team' ? 'team' : 'all',
    projectType: 'all',
    status: 'all',
    search: ''
  });
  const { toast } = useToast();
  
  
  console.log('ProjectsScreen render - user:', user?.id, 'projects:', projects.length);
  console.log('ProjectsScreen - filters:', filters);
  
  // Get conversations data with the new helper functions - using single instance
  const conversationsHook = useConversations(user?.id);
  const { 
    conversations, 
    getProjectConversationCount, 
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount,
    loading: conversationsLoading,
    incrementDocumentCount,
    incrementScheduleCount
  } = conversationsHook;

  console.log('ProjectsScreen - conversations loaded:', conversations.length);
  console.log('ProjectsScreen - conversations:', conversations);

  const fetchProjects = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping project fetch');
      setLoading(false);
      return;
    }
    
    console.log('Fetching projects for user:', user.id, 'workspace context:', workspaceContext);
    setLoading(true);
    try {
      // First get user's team IDs
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);
      
      const userTeamIds = teamMembers?.map(tm => tm.team_id) || [];
      console.log('User team IDs:', userTeamIds);
      
      // Build query based on workspace context
      let query = supabase
        .from('projects')
        .select(`
          *,
          teams!left(
            id,
            name
          )
        `);
      
      // Filter based on workspace context
      if (workspaceContext === 'personal') {
        // Personal workspace: only show personal projects (team_id is null)
        query = query.eq('user_id', user.id).is('team_id', null);
      } else if (workspaceContext === 'team' && userTeamIds.length > 0) {
        // Team workspace: only show team projects user is a member of
        query = query.in('team_id', userTeamIds);
      } else if (workspaceContext === 'all') {
        // All projects (default behavior): personal projects OR team projects
        if (userTeamIds.length > 0) {
          query = query.or(`user_id.eq.${user.id},team_id.in.(${userTeamIds.join(',')})`);
        } else {
          query = query.eq('user_id', user.id);
        }
      } else {
        // Fallback: only personal projects
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching projects:', error);
        throw error;
      }
      
      console.log('ProjectsScreen - fetched projects:', data);
      console.log('ProjectsScreen - number of projects found:', data?.length || 0);
      
      // Process projects to include team name
      const processedProjects = (data || []).map(project => ({
        ...project,
        team_name: project.teams?.name || null
      }));
      
      // Sort projects: pinned first, then by updated_at
      const sortedProjects = processedProjects.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setProjects(sortedProjects);
      console.log('Projects set successfully:', sortedProjects.length);
      console.log('Project IDs available:', sortedProjects.map(p => p.id));
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
    console.log('Projects useEffect triggered, user ID:', user?.id);
    fetchProjects();
  }, [user?.id]);

  // Set up real-time subscription for projects
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for projects');
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Project change detected:', payload);
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up projects subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Handle pending project modal from notifications
  useEffect(() => {
    console.log('📋 ProjectsScreen: Checking pending modal:', { 
      pendingProjectModal, 
      projectsCount: projects.length,
      projectIds: projects.map(p => p.id)
    });
    
    if (pendingProjectModal && projects.length > 0) {
      const project = projects.find(p => p.id === pendingProjectModal.projectId);
      console.log('🔍 Looking for project:', pendingProjectModal.projectId, 'found:', project?.name);
      
      if (project) {
        console.log('✅ Opening project modal from notification:', project.name, pendingProjectModal.view);
        setSelectedProject(project);
        setActiveTab(pendingProjectModal.view);
        setShowProjectDetails(true);
        onProjectModalHandled?.();
      } else {
        console.log('❌ Project not found in projects list');
      }
    }
  }, [pendingProjectModal, projects, onProjectModalHandled]);

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

      fetchProjects();
    } catch (error: any) {
      console.error('Error toggling pin:', error);
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

      const statusLabel = newStatus === 'planning' ? 'Set-up' : newStatus.replace('-', ' ');
      toast({
        title: "Status updated",
        description: `Project status changed to ${statusLabel}.`,
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error updating status:', error);
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
            name: newProject.name.trim(),
            description: newProject.description.trim() || null,
            label: newProject.label,
            status: 'planning',
            customer_name: newProject.customer_name.trim() || null,
            customer_address: newProject.customer_address.trim() || null,
            customer_phone: newProject.customer_phone.trim() || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project created successfully",
        description: `${newProject.name} has been added to your projects.`,
      });

      setNewProject({ 
        name: '', 
        description: '', 
        label: 'Residential',
        customer_name: '',
        customer_address: '',
        customer_phone: ''
      });
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
          status: editingProject.status,
          customer_name: editingProject.customer_name?.trim() || null,
          customer_address: editingProject.customer_address?.trim() || null,
          customer_phone: editingProject.customer_phone?.trim() || null
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

  const handleProjectStatsClick = (project: Project, section: string) => {
    console.log('handleProjectStatsClick called with:', project.name, section);
    setSelectedProject(project);
    setActiveTab(section);
    setShowProjectDetails(true);
    console.log('Modal should now be open with activeTab:', section);
  };

  const handleStartNewChatFromModal = (projectId: string, conversationId?: string) => {
    console.log('Starting chat for project:', projectId, 'conversation:', conversationId);
    if (conversationId) {
      // Open existing conversation
      onStartNewChat(projectId, conversationId);
    } else {
      // Start new chat for project
      onStartNewChat(projectId);
    }
  };

  if (loading || conversationsLoading) {
    console.log('Projects screen loading - projects loading:', loading, 'conversations loading:', conversationsLoading);
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Simple filter function without useMemo to avoid render loops
  const filterProjects = (projects: Project[]) => {
    return projects.filter(project => {
      // Context filter
      if (filters.context === 'personal' && project.team_id) return false;
      if (filters.context === 'team' && !project.team_id) return false;
      
      // Project type filter
      if (filters.projectType !== 'all' && project.label !== filters.projectType) return false;
      
      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = project.name.toLowerCase().includes(searchLower);
        const descriptionMatch = project.description?.toLowerCase().includes(searchLower) || false;
        if (!nameMatch && !descriptionMatch) return false;
      }
      
      return true;
    });
  };

  const filteredProjects = filterProjects(projects);

  console.log('Rendering projects screen with', projects.length, 'total projects,', filteredProjects.length, 'filtered');

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {workspaceContext === 'personal' ? 'Personal Projects' : 
               workspaceContext === 'team' ? 'Team Projects' : 'Projects'}
            </h1>
            <p className="text-gray-400 mt-1">
              {workspaceContext === 'personal' ? 'Manage your personal building regulation projects' :
               workspaceContext === 'team' ? 'Manage your team building regulation projects' :
               'Manage your building regulation projects'}
            </p>
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

      {/* Project Filters */}
      <div className="px-6">
        <ProjectFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          showContextFilter={workspaceContext === 'all'} // Only show context filter when in 'all' mode
          projectCount={filteredProjects.length}
        />
      </div>

      {/* Projects Grid */}
      <div className="flex-1 p-6 pb-32 overflow-y-auto">{/* Added pb-32 for mobile nav spacing */}
        {projects.length === 0 ? (
          <EmptyProjectsState onCreateProject={() => setShowCreateModal(true)} />
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
            <h3 className="text-lg font-medium text-gray-300 mb-2">No projects match your filters</h3>
            <p className="text-sm text-gray-400">Try adjusting your filter criteria or clearing all filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                conversationCount={getProjectConversationCount(project.id)}
                documentCount={getProjectDocumentCount(project.id)}
                scheduleOfWorksCount={getProjectScheduleOfWorksCount(project.id)}
                onStartNewChat={onStartNewChat}
                onEdit={setEditingProject}
                onDelete={deleteProject}
                onTogglePin={togglePinProject}
                onProjectStatsClick={handleProjectStatsClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal - Pass the shared hook */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={showProjectDetails}
        onClose={() => {
          console.log('Closing ProjectDetailsModal');
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
        setEditingProject={setEditingProject}
        onUpdateProject={updateProject}
      />
    </div>
  );
};

export default ProjectsScreen;

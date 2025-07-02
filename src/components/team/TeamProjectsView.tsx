import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { useTeamProjects } from '../../hooks/useTeamProjects';
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsModal from '../ProjectDetailsModal';
import ProjectCard from '../projects/ProjectCard';
import CreateProjectModal from '../projects/CreateProjectModal';
import EditProjectModal from '../projects/EditProjectModal';
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
  onActivity?: (action: string, targetType?: string, targetId?: string, metadata?: any) => void;
}

const TeamProjectsView = ({ user, teamId, teamName, onStartNewChat, onActivity }: TeamProjectsViewProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    label: 'Residential',
    customer_name: '',
    customer_address: '',
    customer_phone: ''
  });
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
  
  // Use the new team projects hook
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
    togglePinProject,
    handleStatusChange
  } = useTeamProjects(teamId, teamName, onActivity);
  
  // Use conversations hook with enabled flag - only when we have valid user and team
  const conversationsEnabled = Boolean(user?.id && teamId);
  const conversationsHook = useConversations(user?.id, conversationsEnabled);
  const { 
    conversations, 
    loading: conversationsLoading,
    error: conversationsError,
    getProjectConversationCount, 
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount,
    incrementDocumentCount,
    incrementScheduleCount
  } = conversationsHook;

  // Early return with proper error handling
  if (!user?.id || !teamId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Loading team information...</div>
          <div className="text-gray-400 text-sm">
            {!user?.id && 'User authentication required'}
            {!teamId && 'Team ID missing'}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (projectsError || conversationsError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Error loading team projects</div>
          <div className="text-gray-400 text-sm">
            {projectsError || conversationsError}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleCreateProject = async () => {
    if (!user?.id || !newProject.name.trim()) return;

    try {
      await createProject({
        user_id: user.id,
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        label: newProject.label,
        customer_name: newProject.customer_name.trim() || undefined,
        customer_address: newProject.customer_address.trim() || undefined,
        customer_phone: newProject.customer_phone.trim() || undefined
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) return;

    try {
      await updateProject(editingProject.id, {
        name: editingProject.name.trim(),
        description: editingProject.description.trim() || null,
        label: editingProject.label,
        status: editingProject.status
      });
      
      setEditingProject(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated conversations and documents.`)) {
      return;
    }

    try {
      await deleteProject(projectId, projectName);
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

  // Simple filtering logic
  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    
    return projects.filter(project => {
      if (filters.projectType !== 'all' && project.label !== filters.projectType) {
        return false;
      }
      
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      
      if (filters.search?.trim()) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = project.name?.toLowerCase().includes(searchLower);
        const descriptionMatch = project.description?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [projects, filters]);

  const loading = projectsLoading || conversationsLoading;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                conversationCount={getProjectConversationCount(project.id)}
                documentCount={getProjectDocumentCount(project.id)}
                scheduleOfWorksCount={getProjectScheduleOfWorksCount(project.id)}
                onStartNewChat={onStartNewChat}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onTogglePin={togglePinProject}
                onProjectStatsClick={handleProjectStatsClick}
                onStatusChange={handleStatusChange}
              />
            ))}
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
        onCreateProject={handleCreateProject}
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
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
};

export default TeamProjectsView;
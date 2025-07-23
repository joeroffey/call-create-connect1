import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  ArrowLeft,
  MessageCircle,
  FileText,
  Calendar,
  CheckSquare,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import EditProjectModal from './EditProjectModal';
import ProjectFiltersComponent, { ProjectFilters } from './ProjectFilters';
import ProjectConversationsTab from './ProjectConversationsTab';
import ProjectDocumentsTab from './ProjectDocumentsTab';
import ProjectScheduleTab from './ProjectScheduleTab';
import ProjectTasksTab from './ProjectTasksTab';
import ProjectDiscussionsTab from './ProjectDiscussionsTab';
import { useProjects } from '@/hooks/useProjects';
import { useConversations } from '@/hooks/useConversations';

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

interface ProjectsPageProps {
  user: any;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
  workspaceContext?: 'personal' | 'team' | 'all';
  teamId?: string;
  teamName?: string;
  pendingProjectModal?: {projectId: string, view: string} | null;
  onProjectModalHandled?: () => void;
}

const ProjectsPage = ({ 
  user, 
  onStartNewChat, 
  workspaceContext = 'all',
  teamId,
  teamName,
  pendingProjectModal,
  onProjectModalHandled
}: ProjectsPageProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('conversations');
  const [filters, setFilters] = useState<ProjectFilters>({
    context: workspaceContext === 'personal' ? 'personal' : workspaceContext === 'team' ? 'team' : 'all',
    projectType: 'all',
    status: 'all',
    search: ''
  });

  // Use the projects hook based on context
  const projectsHook = useProjects(user?.id, workspaceContext, teamId);
  const conversationsHook = useConversations(user?.id);

  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject,
    deleteProject,
    togglePinProject,
    handleStatusChange
  } = projectsHook;

  const {
    conversations,
    getProjectConversationCount,
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount
  } = conversationsHook;

  // Handle pending project modal
  useEffect(() => {
    if (pendingProjectModal && projects.length > 0) {
      const project = projects.find(p => p.id === pendingProjectModal.projectId);
      if (project) {
        setSelectedProject(project);
        setActiveTab(pendingProjectModal.view);
        onProjectModalHandled?.();
      }
    }
  }, [pendingProjectModal, projects, onProjectModalHandled]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (filters.context === 'personal' && project.team_id) return false;
    if (filters.context === 'team' && !project.team_id) return false;
    if (filters.projectType !== 'all' && project.label !== filters.projectType) return false;
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = project.name.toLowerCase().includes(searchLower);
      const descriptionMatch = project.description?.toLowerCase().includes(searchLower) || false;
      if (!nameMatch && !descriptionMatch) return false;
    }
    return true;
  });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('conversations');
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setActiveTab('conversations');
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await createProject({
        ...projectData,
        user_id: user.id,
        team_id: workspaceContext === 'team' ? teamId : undefined
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getTabCount = (tab: string, projectId: string) => {
    switch (tab) {
      case 'conversations':
        return getProjectConversationCount(projectId);
      case 'documents':
        return getProjectDocumentCount(projectId);
      case 'schedule':
        return getProjectScheduleOfWorksCount(projectId);
      case 'tasks':
        return 0; // TODO: Implement task count
      case 'discussions':
        return 0; // TODO: Implement discussion count
      default:
        return 0;
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="projects-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-800/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {workspaceContext === 'personal' ? 'Personal Projects' : 
                     workspaceContext === 'team' ? `${teamName} Projects` : 'Projects'}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {workspaceContext === 'team' 
                      ? `Collaborate on building regulation projects with ${teamName}`
                      : 'Manage your building regulation projects'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <ProjectFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                showContextFilter={workspaceContext === 'all'}
                projectCount={filteredProjects.length}
              />
            </div>

            {/* Projects Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16 bg-gray-900/40 backdrop-blur-sm border border-gray-800/30 rounded-2xl">
                  <h3 className="text-xl font-medium text-gray-300 mb-3">
                    {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {projects.length === 0 
                      ? 'Create your first project to get started'
                      : 'Try adjusting your filter criteria'
                    }
                  </p>
                  {projects.length === 0 && (
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Project
                    </Button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleProjectClick(project)}
                      className="cursor-pointer"
                    >
                      <ProjectCard
                        project={project}
                        index={index}
                        conversationCount={getProjectConversationCount(project.id)}
                        documentCount={getProjectDocumentCount(project.id)}
                        scheduleOfWorksCount={getProjectScheduleOfWorksCount(project.id)}
                        onStartNewChat={onStartNewChat}
                        onEdit={setEditingProject}
                        onDelete={deleteProject}
                        onTogglePin={togglePinProject}
                        onProjectStatsClick={handleProjectClick}
                        onStatusChange={handleStatusChange}
                        
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="project-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Project Header */}
            <div className="px-6 py-6 border-b border-gray-800/20">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
                <div className="h-4 w-px bg-gray-800" />
                <Badge variant="outline" className="capitalize">
                  {selectedProject.status.replace('-', ' ')}
                </Badge>
                {selectedProject.team_name && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {selectedProject.team_name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white mb-2">
                    {selectedProject.name}
                  </h1>
                  {selectedProject.description && (
                    <p className="text-gray-400">
                      {selectedProject.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProject(selectedProject)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    onClick={() => onStartNewChat(selectedProject.id)}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
            </div>

            {/* Project Navigation Tabs */}
            <div className="px-6 py-4 border-b border-gray-800/20">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-gray-900/50">
                  <TabsTrigger value="conversations" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Conversations
                    {getTabCount('conversations', selectedProject.id) > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getTabCount('conversations', selectedProject.id)}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents
                    {getTabCount('documents', selectedProject.id) > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getTabCount('documents', selectedProject.id)}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                    {getTabCount('schedule', selectedProject.id) > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getTabCount('schedule', selectedProject.id)}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Tasks
                    {getTabCount('tasks', selectedProject.id) > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getTabCount('tasks', selectedProject.id)}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Discussions
                    {getTabCount('discussions', selectedProject.id) > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getTabCount('discussions', selectedProject.id)}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                <div className="flex-1 mt-6">
                  <TabsContent value="conversations" className="mt-0">
                    <ProjectConversationsTab
                      project={selectedProject}
                      conversations={conversations.filter((c: any) => c.project_id === selectedProject.id)}
                      onStartNewChat={onStartNewChat}
                      onConversationClick={(conversationId) => {
                        onStartNewChat(selectedProject.id, conversationId);
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="documents" className="mt-0">
                    <ProjectDocumentsTab
                      project={selectedProject}
                      user={user}
                    />
                  </TabsContent>
                  
                  <TabsContent value="schedule" className="mt-0">
                    <ProjectScheduleTab
                      project={selectedProject}
                      user={user}
                    />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="mt-0">
                    <ProjectTasksTab
                      project={selectedProject}
                      user={user}
                    />
                  </TabsContent>
                  
                  <TabsContent value="discussions" className="mt-0">
                    <ProjectDiscussionsTab
                      project={selectedProject}
                      user={user}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newProject={{
          name: '',
          description: '',
          label: 'Residential',
          customer_name: '',
          customer_address: '',
          customer_phone: ''
        }}
        setNewProject={() => {}}
        onCreateProject={async () => {
          // This will be handled in the modal itself
          setShowCreateModal(false);
        }}
      />

      {editingProject && (
        <EditProjectModal
          editingProject={editingProject}
          onClose={() => setEditingProject(null)}
          setEditingProject={setEditingProject}
          onUpdateProject={async () => {
            // This will be handled in the modal itself
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
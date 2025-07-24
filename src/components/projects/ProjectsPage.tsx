import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  ArrowLeft,
  MessageCircle,
  FileText,
  Calendar,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  Clock,
  Star,
  Filter,
  ChevronRight,
  Building2,
  TrendingUp
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
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="projects-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1"
          >
            {/* Professional Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-3">
                      <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        {workspaceContext === 'personal' ? 'My Projects' : 
                         workspaceContext === 'team' ? teamName : 'All Projects'}
                      </h1>
                      <p className="text-muted-foreground text-lg">
                        {workspaceContext === 'team' 
                          ? `Collaborate on building regulation projects with your team`
                          : 'Manage and organize your building regulation projects'
                        }
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      New Project
                    </Button>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-foreground">{filteredProjects.length}</p>
                          <p className="text-sm text-muted-foreground font-medium">Total Projects</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-foreground">
                            {filteredProjects.filter(p => p.status === 'active').length}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">Active</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-foreground">
                            {filteredProjects.filter(p => p.status === 'completed').length}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">Completed</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                          <CheckSquare className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-foreground">
                            {filteredProjects.filter(p => p.pinned).length}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">Starred</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Search and Controls */}
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10 bg-background border-border focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <ProjectFiltersComponent
                        filters={filters}
                        onFiltersChange={setFilters}
                        showContextFilter={workspaceContext === 'all'}
                        projectCount={filteredProjects.length}
                      />
                      
                      <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="px-3 py-2"
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="px-3 py-2"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Content */}
            <div className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                {filteredProjects.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-20 bg-card/30 backdrop-blur border border-border rounded-2xl"
                  >
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Building2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                      {projects.length === 0 
                        ? 'Create your first project to get started with building regulation management'
                        : 'Try adjusting your filter criteria to find projects'
                      }
                    </p>
                    {projects.length === 0 && (
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 shadow-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create First Project
                      </Button>
                    )}
                  </motion.div>
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
                        transition={{ 
                          delay: index * 0.05,
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        className="group cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                      >
                        {viewMode === 'grid' ? (
                          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {project.name}
                                  </h3>
                                  {project.pinned && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {project.description || 'No description provided'}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{getTabCount('conversations', project.id)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>{getTabCount('documents', project.id)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{getTabCount('schedule', project.id)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge
                                variant={
                                  project.status === 'completed' ? 'default' :
                                  project.status === 'active' ? 'secondary' : 'outline'
                                }
                                className={`
                                  ${project.status === 'completed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                                  ${project.status === 'active' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : ''}
                                  font-medium
                                `}
                              >
                                {project.status.replace('-', ' ')}
                              </Badge>
                              
                              {project.team_id && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  <span>Team</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-2">
                                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {project.name}
                                  </h3>
                                  <Badge
                                    variant={
                                      project.status === 'completed' ? 'default' :
                                      project.status === 'active' ? 'secondary' : 'outline'
                                    }
                                    className={`
                                      ${project.status === 'completed' ? 'bg-green-500/10 text-green-500' : ''}
                                      ${project.status === 'active' ? 'bg-blue-500/10 text-blue-500' : ''}
                                      font-medium
                                    `}
                                  >
                                    {project.status.replace('-', ' ')}
                                  </Badge>
                                  {project.pinned && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                                  {project.description || 'No description provided'}
                                </p>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{getTabCount('conversations', project.id)} chats</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span>{getTabCount('documents', project.id)} docs</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{getTabCount('schedule', project.id)} tasks</span>
                                  </div>
                                  {project.team_id && (
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      <span>Team project</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="project-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Professional Project Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="px-6 py-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToList}
                      className="hover:bg-muted/80"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Projects
                    </Button>
                  </div>
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight truncate">
                          {selectedProject.name}
                        </h1>
                        {selectedProject.pinned && (
                          <Star className="w-6 h-6 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                        <Badge
                          variant={
                            selectedProject.status === 'completed' ? 'default' :
                            selectedProject.status === 'active' ? 'secondary' : 'outline'
                          }
                          className={`
                            ${selectedProject.status === 'completed' ? 'bg-green-500/10 text-green-500' : ''}
                            ${selectedProject.status === 'active' ? 'bg-blue-500/10 text-blue-500' : ''}
                            font-medium
                          `}
                        >
                          {selectedProject.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-lg mb-4">
                        {selectedProject.description || 'No description provided'}
                      </p>
                      
                      {selectedProject.team_id && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>Team project: {selectedProject.team_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProject(selectedProject)}
                        className="hover:bg-muted/80"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button
                        onClick={() => onStartNewChat(selectedProject.id)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                  </div>

                  {/* Project Overview Stats */}
                  <div className="grid grid-cols-5 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <MessageCircle className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {getTabCount('conversations', selectedProject.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">Conversations</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {getTabCount('documents', selectedProject.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {getTabCount('schedule', selectedProject.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">Schedule</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <CheckSquare className="w-6 h-6 text-orange-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {getTabCount('tasks', selectedProject.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">Tasks</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {getTabCount('discussions', selectedProject.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">Discussions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Tabs */}
            <div className="flex-1 bg-background">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b border-border bg-card/30 backdrop-blur-sm">
                  <div className="px-6">
                    <div className="max-w-7xl mx-auto">
                      <TabsList className="grid w-full grid-cols-5 bg-transparent p-0 h-auto">
                        <TabsTrigger 
                          value="conversations" 
                          className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 border-b-2 border-transparent hover:bg-muted/50"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Conversations
                          {getTabCount('conversations', selectedProject.id) > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                              {getTabCount('conversations', selectedProject.id)}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="documents"
                          className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 border-b-2 border-transparent hover:bg-muted/50"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Documents
                          {getTabCount('documents', selectedProject.id) > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                              {getTabCount('documents', selectedProject.id)}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="schedule"
                          className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 border-b-2 border-transparent hover:bg-muted/50"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                          {getTabCount('schedule', selectedProject.id) > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                              {getTabCount('schedule', selectedProject.id)}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="tasks"
                          className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 border-b-2 border-transparent hover:bg-muted/50"
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Tasks
                          {getTabCount('tasks', selectedProject.id) > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                              {getTabCount('tasks', selectedProject.id)}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="discussions"
                          className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 border-b-2 border-transparent hover:bg-muted/50"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Discussions
                          {getTabCount('discussions', selectedProject.id) > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                              {getTabCount('discussions', selectedProject.id)}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="max-w-7xl mx-auto h-full">
                    <TabsContent value="conversations" className="mt-0 h-full">
                      <ProjectConversationsTab
                        project={selectedProject}
                        conversations={conversations.filter(c => c.project_id === selectedProject.id)}
                        onStartNewChat={() => onStartNewChat(selectedProject.id)}
                        onConversationClick={(conversationId) => onStartNewChat(selectedProject.id, conversationId)}
                      />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-0 h-full">
                      <ProjectDocumentsTab project={selectedProject} user={user} />
                    </TabsContent>
                    <TabsContent value="schedule" className="mt-0 h-full">
                      <ProjectScheduleTab project={selectedProject} user={user} />
                    </TabsContent>
                    <TabsContent value="tasks" className="mt-0 h-full">
                      <ProjectTasksTab project={selectedProject} user={user} />
                    </TabsContent>
                    <TabsContent value="discussions" className="mt-0 h-full">
                      <ProjectDiscussionsTab project={selectedProject} user={user} />
                    </TabsContent>
                  </div>
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
        onCreateProject={(data) => { handleCreateProject(data); }}
        workspaceContext={workspaceContext}
        teamName={teamName}
      />

      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onUpdateProject={async (projectId, updates) => { await updateProject(projectId, updates); }}
          onDeleteProject={async (projectId, projectName) => { await deleteProject(projectId, projectName); }}
          onTogglePinProject={async (projectId, currentPinned) => { await togglePinProject(projectId, currentPinned); }}
          onStatusChange={async (projectId, newStatus) => { await handleStatusChange(projectId, newStatus); }}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
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
  Settings,
  BarChart3,
  Clock,
  Star,
  ChevronRight
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950 min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="projects-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1"
          >
            {/* Modern Header */}
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
              <div className="px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {workspaceContext === 'personal' ? 'My Projects' : 
                       workspaceContext === 'team' ? teamName : 'All Projects'}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      {workspaceContext === 'team' 
                        ? `Collaborate on building regulation projects`
                        : 'Manage your building regulation projects'
                      }
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{filteredProjects.length}</p>
                        <p className="text-sm text-muted-foreground">Total Projects</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredProjects.filter(p => p.status === 'completed').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredProjects.filter(p => p.status === 'active').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredProjects.filter(p => p.pinned).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Pinned</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                  <ProjectFiltersComponent
                    filters={filters}
                    onFiltersChange={setFilters}
                    showContextFilter={workspaceContext === 'all'}
                    projectCount={filteredProjects.length}
                  />
                  <div className="flex items-center bg-background/50 rounded-lg p-1 border border-border/50">
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
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="px-8 py-6">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-card/30 backdrop-blur border border-border/30 rounded-2xl">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {projects.length === 0 
                      ? 'Create your first project to get started with building regulation management'
                      : 'Try adjusting your filter criteria to find projects'
                    }
                  </p>
                  {projects.length === 0 && (
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create First Project
                    </Button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer"
                      onClick={() => handleProjectClick(project)}
                    >
                      {viewMode === 'grid' ? (
                        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:bg-card/70 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                                {project.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description || 'No description provided'}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              project.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              project.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-gray-500/10 text-gray-500'
                            }`}>
                              {project.status.replace('-', ' ')}
                            </div>
                            {project.pinned && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:bg-card/70 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {project.name}
                                </h3>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  project.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                  project.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {project.status.replace('-', ' ')}
                                </div>
                                {project.pinned && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {project.description || 'No description provided'}
                              </p>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{getTabCount('conversations', project.id)} conversations</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{getTabCount('documents', project.id)} documents</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{getTabCount('schedule', project.id)} schedule items</span>
                                </div>
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
          </motion.div>
        ) : (
          <motion.div
            key="project-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Modern Project Header */}
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
              <div className="px-8 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                  </Button>
                  <div className="h-4 w-px bg-border" />
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProject.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    selectedProject.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {selectedProject.status.replace('-', ' ')}
                  </div>
                  {selectedProject.team_name && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
                      <Users className="w-3 h-3" />
                      {selectedProject.team_name}
                    </div>
                  )}
                  {selectedProject.pinned && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                      {selectedProject.name}
                    </h1>
                    {selectedProject.description && (
                      <p className="text-muted-foreground text-lg">
                        {selectedProject.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditingProject(selectedProject)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      onClick={() => onStartNewChat(selectedProject.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                </div>

                {/* Project Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{getTabCount('conversations', selectedProject.id)}</p>
                        <p className="text-xs text-muted-foreground">Conversations</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{getTabCount('documents', selectedProject.id)}</p>
                        <p className="text-xs text-muted-foreground">Documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{getTabCount('schedule', selectedProject.id)}</p>
                        <p className="text-xs text-muted-foreground">Schedule Items</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{getTabCount('tasks', selectedProject.id)}</p>
                        <p className="text-xs text-muted-foreground">Active Tasks</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{getTabCount('discussions', selectedProject.id)}</p>
                        <p className="text-xs text-muted-foreground">Discussions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="bg-background/95 backdrop-blur border-b border-border/40">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-8">
                  <TabsList className="grid w-full grid-cols-5 bg-muted/50 h-12">
                    <TabsTrigger value="conversations" className="flex items-center gap-2 font-medium">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Conversations</span>
                      {getTabCount('conversations', selectedProject.id) > 0 && (
                        <div className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                          {getTabCount('conversations', selectedProject.id)}
                        </div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Documents</span>
                      {getTabCount('documents', selectedProject.id) > 0 && (
                        <div className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                          {getTabCount('documents', selectedProject.id)}
                        </div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Schedule</span>
                      {getTabCount('schedule', selectedProject.id) > 0 && (
                        <div className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                          {getTabCount('schedule', selectedProject.id)}
                        </div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center gap-2 font-medium">
                      <CheckSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Tasks</span>
                      {getTabCount('tasks', selectedProject.id) > 0 && (
                        <div className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                          {getTabCount('tasks', selectedProject.id)}
                        </div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="discussions" className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Discussions</span>
                      {getTabCount('discussions', selectedProject.id) > 0 && (
                        <div className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                          {getTabCount('discussions', selectedProject.id)}
                        </div>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content with Better Spacing */}
                <div className="px-8 py-8">
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
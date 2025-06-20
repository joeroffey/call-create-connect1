
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FolderOpen, 
  MessageCircle, 
  Image, 
  FileText, 
  Calendar,
  Users,
  Download,
  Edit3,
  Trash2,
  Upload,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Edit,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: 'planning' | 'in-progress' | 'completed';
  chat_count: number;
  image_count: number;
  milestone_count: number;
  label?: string;
  user_id: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  created_at: string;
}

interface ProjectsScreenProps {
  user: any;
  onStartNewChat?: (projectId: string) => void;
}

const ProjectsScreen = ({ user, onStartNewChat }: ProjectsScreenProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user?.id]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedProjects = (data || []).map(project => ({
        ...project,
        chat_count: 0,
        image_count: 0,
        milestone_count: 0
      }));
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadMilestones = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const handleCreateProject = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      
      if (!name || !name.trim()) {
        toast({
          title: "Validation Error",
          description: "Project name is required.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            description: description?.trim() || '',
            status: 'planning'
          }
        ]);

      if (error) throw error;

      await loadProjects();
      setShowCreateModal(false);
      toast({
        title: "Project Created",
        description: `${name} has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMilestone = async (formData: FormData) => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const dueDate = formData.get('due_date') as string;
      
      if (!title || !title.trim()) {
        toast({
          title: "Validation Error",
          description: "Milestone title is required.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('project_milestones')
        .insert([
          {
            project_id: selectedProject.id,
            user_id: user.id,
            title: title.trim(),
            description: description?.trim() || '',
            due_date: dueDate || null,
            completed: false
          }
        ]);

      if (error) throw error;

      await loadMilestones(selectedProject.id);
      await loadProjects();
      setShowMilestoneModal(false);
      toast({
        title: "Milestone Created",
        description: `${title} has been added to the project.`
      });
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to create milestone. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ completed: !completed })
        .eq('id', milestoneId);

      if (error) throw error;

      if (selectedProject) {
        await loadMilestones(selectedProject.id);
        await loadProjects();
      }
      
      toast({
        title: "Milestone Updated",
        description: `Milestone marked as ${!completed ? 'completed' : 'incomplete'}.`
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) throw error;

      await loadProjects();
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      setShowProjectDetails(false);
      toast({
        title: "Project Deleted",
        description: `${projectToDelete.name} has been permanently deleted.`
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      setEditingStatus(null);
      toast({
        title: "Status Updated",
        description: `Project status changed to ${newStatus.replace('-', ' ')}.`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update project status.",
        variant: "destructive"
      });
    }
  };

  const handleNewChat = (projectId: string) => {
    if (onStartNewChat) {
      onStartNewChat(projectId);
    }
  };

  const handleDocumentUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProject) return;

    await uploadDocument(file, selectedProject.id);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadDocument = async (file: File, projectId: string) => {
    setIsUploading(true);
    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, Word, text, or image files only.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${projectId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('project_documents')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size
          }
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMilestones = () => {
    if (selectedProject) {
      loadMilestones(selectedProject.id);
      setShowMilestoneModal(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-gray-400">Manage your building projects and track progress</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {projects.length === 0 ? 'No Projects Yet' : 'No Projects Found'}
            </h3>
            <p className="text-gray-400 mb-6">
              {projects.length === 0 
                ? 'Create your first project to get started with EezyBuild'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {projects.length === 0 && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-professional hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white group-hover:text-emerald-300 transition-colors mb-2">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-3 flex-wrap gap-2">
                          {editingStatus === project.id ? (
                            <select
                              value={project.status}
                              onChange={(e) => handleStatusChange(project.id, e.target.value as any)}
                              className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1"
                              autoFocus
                              onBlur={() => setEditingStatus(null)}
                            >
                              <option value="planning">Planning</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(project.status)}
                              <Badge 
                                className={`text-xs cursor-pointer ${getStatusColor(project.status)}`}
                                onClick={() => setEditingStatus(project.id)}
                              >
                                {project.status.replace('-', ' ')}
                                <Edit className="w-3 h-3 ml-1" />
                              </Badge>
                            </div>
                          )}
                          {project.label && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                              <Tag className="w-3 h-3 mr-1" />
                              {project.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent 
                    className="pt-0"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDetails(true);
                    }}
                  >
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-emerald-400">{project.chat_count}</div>
                        <div className="text-xs text-gray-500">Chats</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{project.image_count}</div>
                        <div className="text-xs text-gray-500">Images</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{project.milestone_count}</div>
                        <div className="text-xs text-gray-500">Milestones</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Create Project Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription className="text-gray-400">
                Start a new building project to organize your work and track progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateProject(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium mb-2">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <Input
                  id="project-name"
                  name="name"
                  placeholder="e.g., Kitchen Extension"
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  id="project-description"
                  name="description"
                  placeholder="Describe your project..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Project Details Modal */}
        <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedProject && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        {selectedProject.description}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedProject.label && (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          <Tag className="w-3 h-3 mr-1" />
                          {selectedProject.label}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProjectToDelete(selectedProject);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-gray-800 border-gray-700">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
                    <TabsTrigger value="milestones" className="data-[state=active]:bg-gray-700">Milestones</TabsTrigger>
                    <TabsTrigger value="chats" className="data-[state=active]:bg-gray-700">Chats</TabsTrigger>
                    <TabsTrigger value="images" className="data-[state=active]:bg-gray-700">Images</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{selectedProject.chat_count}</div>
                          <div className="text-sm text-gray-400">Active Chats</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <Image className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{selectedProject.image_count}</div>
                          <div className="text-sm text-gray-400">Images</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{selectedProject.milestone_count}</div>
                          <div className="text-sm text-gray-400">Milestones</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button 
                          onClick={() => handleNewChat(selectedProject.id)}
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          New Chat
                        </Button>
                        <Button 
                          onClick={handleDocumentUpload}
                          disabled={isUploading}
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                        >
                          <Upload className={`w-4 h-4 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
                          {isUploading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                        <Button 
                          onClick={handleMilestones}
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Milestones
                        </Button>
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          <Download className="w-4 h-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="milestones">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Project Milestones</h3>
                        <Button 
                          onClick={() => setShowMilestoneModal(true)}
                          className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Milestone
                        </Button>
                      </div>
                      
                      {milestones.length === 0 ? (
                        <div className="text-center py-8">
                          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">No Milestones Yet</h3>
                          <p className="text-gray-400 mb-4">Track important deadlines and achievements for this project</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {milestones.map((milestone) => (
                            <Card key={milestone.id} className="bg-gray-800/50 border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3 flex-1">
                                    <button
                                      onClick={() => handleToggleMilestone(milestone.id, milestone.completed)}
                                      className={`mt-1 p-1 rounded-full ${
                                        milestone.completed 
                                          ? 'text-green-400 hover:text-green-300' 
                                          : 'text-gray-400 hover:text-gray-300'
                                      }`}
                                    >
                                      <CheckCircle2 className={`w-5 h-5 ${milestone.completed ? 'fill-current' : ''}`} />
                                    </button>
                                    <div className="flex-1">
                                      <h4 className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {milestone.title}
                                      </h4>
                                      {milestone.description && (
                                        <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                                      )}
                                      {milestone.due_date && (
                                        <p className="text-xs text-gray-500 mt-2">
                                          Due: {new Date(milestone.due_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="chats">
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Chats Yet</h3>
                      <p className="text-gray-400 mb-4">Start a conversation about this project</p>
                      <Button 
                        onClick={() => handleNewChat(selectedProject.id)}
                        className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="images">
                    <div className="text-center py-8">
                      <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Images Yet</h3>
                      <p className="text-gray-400 mb-4">Upload project images and documents</p>
                      <Button 
                        onClick={handleDocumentUpload}
                        className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Milestone Creation Modal */}
        <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new milestone to track progress on this project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateMilestone(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <label htmlFor="milestone-title" className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <Input
                  id="milestone-title"
                  name="title"
                  placeholder="e.g., Foundation Complete"
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label htmlFor="milestone-description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  id="milestone-description"
                  name="description"
                  placeholder="Optional description..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label htmlFor="milestone-due-date" className="block text-sm font-medium mb-2">
                  Due Date
                </label>
                <Input
                  id="milestone-due-date"
                  name="due_date"
                  type="date"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowMilestoneModal(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create Milestone'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete Project</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and will permanently delete all associated chats, documents, and milestones.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProjectToDelete(null);
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectsScreen;

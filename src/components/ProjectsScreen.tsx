import React, { useState, useEffect } from 'react';
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
  Edit
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

interface ProjectsScreenProps {
  user: any;
  onStartNewChat?: (projectId: string) => void;
}

const ProjectsScreen = ({ user, onStartNewChat }: ProjectsScreenProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // Load projects from database
  useEffect(() => {
    if (user?.id) {
      loadProjects();
    }
  }, [user?.id]);

  const loadProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get conversation counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          return {
            ...project,
            description: project.description || '',
            label: project.label || undefined,
            status: project.status as 'planning' | 'in-progress' | 'completed',
            chat_count: count || 0,
            image_count: 0, // TODO: Implement when images are added
            milestone_count: 0 // TODO: Implement when milestones are added
          };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateAILabel = async (name: string, description: string): Promise<string> => {
    try {
      const response = await fetch('https://srwbgkssoatrhxdrrtff.supabase.co/functions/v1/building-regulations-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2Jna3Nzb2F0cmh4ZHJydGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzE0OTcsImV4cCI6MjA2NTkwNzQ5N30.FxPPrtKlz5MZxnS_6kAHMOMJiT25DYXOKzT1V9k-KhU'
        },
        body: JSON.stringify({
          message: `Based on this project name "${name}" and description "${description}", provide a single, short label (2-3 words max) that categorizes this building project. Examples: "Fire Safety", "Structural Work", "Extension", "Renovation", "Planning Permission", "Energy Efficiency". Only respond with the label, nothing else.`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response.trim().replace(/['"]/g, '');
      }
    } catch (error) {
      console.error('Error generating AI label:', error);
    }
    
    // Fallback to simple keyword matching
    const text = `${name} ${description}`.toLowerCase();
    if (text.includes('fire') || text.includes('safety')) return 'Fire Safety';
    if (text.includes('structural') || text.includes('beam') || text.includes('foundation')) return 'Structural';
    if (text.includes('extension') || text.includes('extend')) return 'Extension';
    if (text.includes('kitchen') || text.includes('bathroom')) return 'Renovation';
    if (text.includes('planning') || text.includes('permission')) return 'Planning';
    if (text.includes('energy') || text.includes('insulation')) return 'Energy Efficiency';
    
    return 'General';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateProject = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      
      // Generate AI label
      const aiLabel = await generateAILabel(name, description);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name,
            description,
            label: aiLabel,
            status: 'planning'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      await loadProjects(); // Reload projects
      setShowCreateModal(false);
      toast({
        title: "Project Created",
        description: `${name} has been created with label "${aiLabel}".`
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

  const handleStatusChange = async (projectId: string, newStatus: 'planning' | 'in-progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects(); // Reload projects
      setEditingStatus(null);
      toast({
        title: "Status Updated",
        description: `Project status changed to ${newStatus.replace('-', ' ')}.`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNewChat = (projectId: string) => {
    if (onStartNewChat) {
      onStartNewChat(projectId);
    } else {
      toast({
        title: "Feature Coming Soon",
        description: "Project-specific chat functionality will be available soon."
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-gray-400">
              Organize your building projects with chats, images, and milestones
            </p>
          </div>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Start a new building project. We'll automatically assign a relevant category label.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Project Name</label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Kitchen Extension"
                    required
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the project..."
                    className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
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
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No Projects Found' : 'No Projects Yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first project to organize your building work'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </motion.div>
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
                    </div>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div className="flex flex-col items-center">
                        <MessageCircle className="w-4 h-4 text-blue-400 mb-1" />
                        <span className="text-xs text-gray-400">{project.chat_count} chats</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Image className="w-4 h-4 text-green-400 mb-1" />
                        <span className="text-xs text-gray-400">{project.image_count} images</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mb-1" />
                        <span className="text-xs text-gray-400">{project.milestone_count} milestones</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDetails(true);
                      }}
                      className="w-full gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                    >
                      Open Project
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

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
                    {selectedProject.label && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <Tag className="w-3 h-3 mr-1" />
                        {selectedProject.label}
                      </Badge>
                    )}
                  </div>
                </DialogHeader>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-gray-800 border-gray-700">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="chats">Chats</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{selectedProject.chat_count}</div>
                          <div className="text-sm text-gray-400">AI Conversations</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <Image className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{selectedProject.image_count}</div>
                          <div className="text-sm text-gray-400">Images & Plans</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4 text-center">
                          <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
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
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Milestone
                        </Button>
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          <Download className="w-4 h-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="chats">
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Project Chats</h3>
                      <p className="text-gray-400 mb-4">All AI conversations for this project will appear here</p>
                      <Button 
                        onClick={() => handleNewChat(selectedProject.id)}
                        className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                      >
                        Start New Chat
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="images">
                    <div className="text-center py-8">
                      <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Project Images</h3>
                      <p className="text-gray-400 mb-4">Floor plans, photos, and documents for this project</p>
                      <Button className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="milestones">
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Project Milestones</h3>
                      <p className="text-gray-400 mb-4">Track important deadlines and achievements</p>
                      <Button className="gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Milestone
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectsScreen;

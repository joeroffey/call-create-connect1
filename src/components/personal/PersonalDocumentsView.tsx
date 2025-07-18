import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Upload, Plus, Folder, Shield, Calendar, Files, MoreVertical, FolderOpen, FolderPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCompletionDocuments } from '@/hooks/useCompletionDocuments';
import { CompletionDocsUpload } from '../team/CompletionDocsUpload';
import { CompletionDocsViewer } from '../team/CompletionDocsViewer';
import { CompletionDocsList } from '../team/CompletionDocsList';
import { CreateFolderModal } from '../team/CreateFolderModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PersonalDocumentsViewProps {
  userId: string;
  preSelectedProjectId?: string | null;
}

const categoryIcons = {
  'building-control': 'Building',
  'certificates': 'Award',
  'warranties': 'Shield',
  'approved-documents': 'FileCheck',
  'other': 'FileText',
};

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
};

export default function PersonalDocumentsView({ userId, preSelectedProjectId }: PersonalDocumentsViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  
  const { toast } = useToast();
  
  // Use the completion documents hook
  const { 
    data: documents, 
    isLoading: loading, 
    uploadDocument, 
    refetch: refetchDocuments 
  } = useCompletionDocuments(selectedProject);

  // Fetch personal projects
  useEffect(() => {
    fetchPersonalProjects();
  }, [userId]);

  // Auto-select project if preSelectedProjectId is provided
  useEffect(() => {
    if (preSelectedProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === preSelectedProjectId);
      if (project) {
        setSelectedProject(preSelectedProjectId);
      }
    }
  }, [preSelectedProjectId, projects]);

  const fetchPersonalProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status')
        .eq('user_id', userId)
        .is('team_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching personal projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading projects",
        description: "Please try again later.",
      });
    }
  };

  const fetchFolders = async () => {
    if (!selectedProject) return;

    try {
      const query = supabase
        .from('completion_document_folders')
        .select('*')
        .eq('project_id', selectedProject);

      if (currentFolderId) {
        query.eq('parent_folder_id', currentFolderId);
      } else {
        query.is('parent_folder_id', null);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleUploadSuccess = () => {
    refetchDocuments();
    setShowUploadModal(false);
  };

  const handleCreateFolder = async (name: string): Promise<boolean> => {
    if (!selectedProject) return false;

    try {
      const { error } = await supabase
        .from('completion_document_folders')
        .insert({
          name,
          project_id: selectedProject,
          team_id: null, // Personal projects use null for team_id
          parent_folder_id: currentFolderId,
          created_by: userId
        });

      if (error) throw error;

      toast({
        title: "Folder created",
        description: `Folder "${name}" has been created successfully.`,
      });

      fetchFolders();
      setShowCreateFolderModal(false);
      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        variant: "destructive",
        title: "Error creating folder",
        description: "Please try again later.",
      });
      return false;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!selectedProject) {
    return (
      <div className="p-6 pb-24 md:pb-6">
        <h2 className="text-3xl font-bold text-white mb-6">Documents</h2>
        
        {projects.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Files className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
              <p className="text-gray-400 mb-4">
                Create your first project to start managing documents.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <p className="text-gray-400 mb-6">Select a project to view and manage documents.</p>
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card 
                  key={project.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
                  onClick={() => setSelectedProject(project.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                        )}
                      </div>
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="p-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedProject(null);
              setCurrentFolderId(null);
            }}
            className="text-gray-400 hover:text-white flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white truncate">{selectedProjectData?.name}</h2>
            <p className="text-gray-400 text-sm">Documents</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowCreateFolderModal(true)} variant="outline" className="flex-shrink-0">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)} className="flex-shrink-0">
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Folder navigation */}
      {currentFolderId && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentFolderId(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-gray-400">Back to root folder</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {/* Folders */}
        {folders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-medium">{folder.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Documents */}
        <CompletionDocsList
          documents={filteredDocuments}
          onViewDocument={setSelectedDocument}
          loading={loading}
        />
      </div>

      {/* Modals */}
      {showUploadModal && (
        <CompletionDocsUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          projectId={selectedProject}
          teamId={null} // Personal projects don't have teams
          folderId={currentFolderId}
          onUploadComplete={handleUploadSuccess}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          open={showCreateFolderModal}
          onOpenChange={setShowCreateFolderModal}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {selectedDocument && (
        <CompletionDocsViewer
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}
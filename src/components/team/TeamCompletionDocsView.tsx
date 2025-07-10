import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Upload, Plus, Folder, Shield, Settings, Home } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTeamProjects } from '@/hooks/useTeamProjects';
import { useCompletionDocuments } from '@/hooks/useCompletionDocuments';
import { useTeamCompletionDocuments } from '@/hooks/useTeamCompletionDocuments';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useFolders } from '@/hooks/useFolders';
import { CompletionDocsUpload } from './CompletionDocsUpload';
import { CompletionDocsViewer } from './CompletionDocsViewer';
import { CompletionDocsList } from './CompletionDocsList';
import { FolderTreeView } from './FolderTreeView';
import { ProjectAccessModal } from './ProjectAccessModal';
import { supabase } from '@/integrations/supabase/client';

interface TeamCompletionDocsViewProps {
  teamId: string;
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

export default function TeamCompletionDocsView({ teamId }: TeamCompletionDocsViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const { projects, loading: projectsLoading } = useTeamProjects(teamId);
  const { data: allDocuments, getDocumentsByProject, refetch } = useTeamCompletionDocuments(teamId);
  const { members: teamMembers } = useTeamMembers(teamId);
  
  // Get current user role
  const getCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const currentMember = teamMembers.find(member => member.user_id === user.id);
    return currentMember?.role || null;
  };
  
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    getCurrentUserRole().then(setCurrentUserRole);
  }, [teamMembers]);
  const { folders, getFolderPath } = useFolders(selectedProject, teamId);

  const canManageAccess = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canCreateFolders = canManageAccess;

  const selectedProjectData = selectedProject 
    ? projects.find(p => p.id === selectedProject)
    : null;
  
  const documentsForProject = selectedProject 
    ? getDocumentsByProject(selectedProject)
    : [];

  const filteredDocuments = documentsForProject.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesFolder = currentFolderId === null 
      ? !doc.folder_id 
      : doc.folder_id === currentFolderId;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  const currentFolderPath = currentFolderId ? getFolderPath(currentFolderId) : [];
  const currentFolderName = currentFolderPath.length > 0 
    ? currentFolderPath[currentFolderPath.length - 1].name 
    : 'Project Root';

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Select a Project</h2>
            {canManageAccess && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Team Projects Found</h3>
              <p className="text-muted-foreground">
                Create a team project to start managing completion documents.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects
                .filter(project => 
                  project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(project => {
                  const documentCount = getDocumentsByProject(project.id).length;
                  
                  return (
                    <div
                      key={project.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Folder className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">{project.name}</span>
                        </div>
                        <Badge variant="secondary">
                          {documentCount} docs
                        </Badge>
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Team Project
                        </span>
                        <Button variant="ghost" size="sm">
                          View →
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Document Management View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folder Tree */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Folders</h3>
              {canManageAccess && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccessModal(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FolderTreeView
              projectId={selectedProject!}
              teamId={teamId}
              currentFolderId={currentFolderId}
              onFolderSelect={setCurrentFolderId}
              canCreateFolders={canCreateFolders}
              canManageAccess={canManageAccess}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProject(null);
                setCurrentFolderId(null);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{selectedProjectData?.name || 'Unknown Project'}</h2>
              {canManageAccess && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span 
              className="cursor-pointer hover:text-foreground"
              onClick={() => setCurrentFolderId(null)}
            >
              {selectedProjectData?.name}
            </span>
            {currentFolderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <span>/</span>
                <span 
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  {folder.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search in ${currentFolderName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </div>

          <CompletionDocsList
            documents={filteredDocuments}
            loading={false}
            onViewDocument={setSelectedDocument}
          />
        </div>
      </div>

      {/* Project Access Modal */}
      {showAccessModal && selectedProject && (
        <ProjectAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          projectId={selectedProject}
          teamId={teamId}
          projectName={selectedProjectData?.name || 'Unknown Project'}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedProject && (
        <CompletionDocsUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          projectId={selectedProject}
          teamId={teamId}
          folderId={currentFolderId}
          onUploadComplete={() => {
            refetch();
            setShowUploadModal(false);
          }}
        />
      )}

      {/* Document Viewer */}
      {selectedDocument && (
        <CompletionDocsViewer
          isOpen={true}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
          onDelete={() => {
            refetch();
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}
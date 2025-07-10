import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Upload, Plus, Folder, Shield, Settings, Users, Calendar, Files, MoreVertical, FolderOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTeamProjects } from '@/hooks/useTeamProjects';
import { useTeamCompletionDocuments } from '@/hooks/useTeamCompletionDocuments';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useFolders } from '@/hooks/useFolders';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { CompletionDocsUpload } from './CompletionDocsUpload';
import { CompletionDocsViewer } from './CompletionDocsViewer';
import { CompletionDocsList } from './CompletionDocsList';
import { ProjectAccessModal } from './ProjectAccessModal';
import { FolderAccessModal } from './FolderAccessModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [showFolderAccessModal, setShowFolderAccessModal] = useState(false);
  const [selectedFolderForAccess, setSelectedFolderForAccess] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

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
  const { folders, getFolderPath, createFolder } = useFolders(selectedProject, teamId);
  const { permissions: projectPermissions } = useProjectPermissions(selectedProject);
  const { toast } = useToast();

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
  const currentFolderData = currentFolderId 
    ? folders.find(f => f.id === currentFolderId)
    : null;

  // Get root folders (folders without parent)
  const rootFolders = folders.filter(folder => !folder.parent_folder_id);

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const success = await createFolder(newFolderName.trim(), currentFolderId);
    if (success) {
      setNewFolderName('');
      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created successfully.`,
      });
    }
  };

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentFolderId) {
                setCurrentFolderId(null);
              } else {
                setSelectedProject(null);
              }
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentFolderId ? 'Back to Project' : 'Back to Projects'}
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {currentFolderData ? currentFolderData.name : selectedProjectData?.name || 'Unknown Project'}
            </h1>
            {canManageAccess && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageAccess && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAccessModal(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Access
            </Button>
          )}
          
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolderId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${currentFolderData ? 'in folder' : 'documents'}...`}
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
      </div>

      {/* Content Area */}
      {!currentFolderId ? (
        // Folder Grid View (Project Level)
        <div className="space-y-6">
          {/* Create New Folder */}
          {canCreateFolders && (
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Input
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-48"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <Button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Folder
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a new folder to organize your completion documents
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Folders */}
          {rootFolders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rootFolders.map(folder => {
                const folderDocCount = documentsForProject.filter(doc => doc.folder_id === folder.id).length;
                const recentDoc = documentsForProject
                  .filter(doc => doc.folder_id === folder.id)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                return (
                  <Card 
                    key={folder.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                            <FolderOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{folder.name}</CardTitle>
                            <CardDescription>
                              {folderDocCount} document{folderDocCount !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                        </div>
                        {canManageAccess && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFolderForAccess(folder.id);
                                  setShowFolderAccessModal(true);
                                }}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentDoc ? (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Last updated {new Date(recentDoc.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No documents yet</div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Files className="h-3 w-3" />
                            <span>Completion Documents</span>
                          </div>
                          <div className="text-xs text-primary font-medium">
                            Open →
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Direct Project Documents (no folder) */}
          {documentsForProject.filter(doc => !doc.folder_id).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Files className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Project Documents</h3>
                <Badge variant="secondary">
                  {documentsForProject.filter(doc => !doc.folder_id).length}
                </Badge>
              </div>
              <CompletionDocsList
                documents={filteredDocuments.filter(doc => !doc.folder_id)}
                loading={false}
                onViewDocument={setSelectedDocument}
              />
            </div>
          )}

          {/* Empty State */}
          {rootFolders.length === 0 && documentsForProject.filter(doc => !doc.folder_id).length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No folders or documents yet</h3>
              <p className="text-muted-foreground mb-6">
                Create folders to organize your completion documents or upload documents directly.
              </p>
              <div className="flex items-center justify-center gap-3">
                {canCreateFolders && (
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Folder
                  </Button>
                )}
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Document List View (Inside Folder)
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Folder Contents</h3>
              <Badge variant="secondary">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {canManageAccess && currentFolderId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFolderForAccess(currentFolderId);
                  setShowFolderAccessModal(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Folder Access
              </Button>
            )}
          </div>
          
          <CompletionDocsList
            documents={filteredDocuments}
            loading={false}
            onViewDocument={setSelectedDocument}
          />

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <Files className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">This folder is empty</h3>
              <p className="text-muted-foreground mb-6">
                Upload documents to organize your completion documents in this folder.
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          )}
        </div>
      )}

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

      {/* Folder Access Modal */}
      {showFolderAccessModal && selectedFolderForAccess && (
        <FolderAccessModal
          isOpen={showFolderAccessModal}
          onClose={() => {
            setShowFolderAccessModal(false);
            setSelectedFolderForAccess(null);
          }}
          folderId={selectedFolderForAccess}
          teamId={teamId}
          folderName={folders.find(f => f.id === selectedFolderForAccess)?.name || 'Unknown Folder'}
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
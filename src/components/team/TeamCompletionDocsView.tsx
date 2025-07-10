import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Upload, Plus, Folder, Shield, Settings, Users, Calendar, Files, MoreVertical, FolderOpen, FolderPlus } from 'lucide-react';
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

import { FolderAccessModal } from './FolderAccessModal';
import { CreateFolderModal } from './CreateFolderModal';
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
  
  const [showFolderAccessModal, setShowFolderAccessModal] = useState(false);
  const [selectedFolderForAccess, setSelectedFolderForAccess] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

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
  const handleCreateFolder = async (folderName: string) => {
    const success = await createFolder(folderName, currentFolderId);
    if (success) {
      toast({
        title: "Folder created",
        description: `Folder "${folderName}" has been created successfully.`,
      });
    }
    return success;
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Project Documents</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select a project to manage completion documents and folders
              </p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 rounded-full bg-muted/30 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Folder className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">No Team Projects Found</h3>
                <p className="text-muted-foreground text-base max-w-md mx-auto">
                  Create a team project to start managing completion documents and organize your files.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className="group cursor-pointer"
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <Card className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:scale-105">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                              <Folder className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-3xl font-bold text-white">
                                {documentCount}
                              </div>
                              <div className="text-sm text-gray-400">{project.name}</div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            {/* Back Button */}
            <div>
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
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Title Section */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {currentFolderData ? currentFolderData.name : selectedProjectData?.name || 'Unknown Project'}
              </h1>
              <p className="text-muted-foreground">
                {currentFolderId ? 'Folder contents' : 'Project documents and folders'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {canCreateFolders && (
                <Button
                  onClick={() => setShowCreateFolderModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Folder
                </Button>
              )}
              
              
              <Button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          {currentFolderId && (
            <div className="flex items-center gap-2 text-sm">
              <span 
                className="cursor-pointer hover:text-primary transition-colors text-muted-foreground hover:underline"
                onClick={() => setCurrentFolderId(null)}
              >
                {selectedProjectData?.name}
              </span>
              {currentFolderPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground">/</span>
                  <span 
                    className="cursor-pointer hover:text-primary transition-colors text-muted-foreground hover:underline"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    {folder.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={`Search ${currentFolderData ? 'in folder' : 'documents'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-11">
                <SelectValue placeholder="All Categories" />
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
            <div className="space-y-8">
              {/* Existing Folders */}
              {rootFolders.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Folders</h2>
                      <p className="text-sm text-muted-foreground">Organize your completion documents</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rootFolders.map(folder => {
                      const folderDocCount = documentsForProject.filter(doc => doc.folder_id === folder.id).length;
                      const recentDoc = documentsForProject
                        .filter(doc => doc.folder_id === folder.id)
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                      return (
                        <div
                          key={folder.id}
                          className="group cursor-pointer"
                          onClick={() => setCurrentFolderId(folder.id)}
                        >
                          <Card className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:scale-105 relative">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-orange-500/20 rounded-xl">
                                <FolderOpen className="h-6 w-6 text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-3xl font-bold text-white">
                                  {folderDocCount}
                                </div>
                                <div className="text-sm text-gray-400">{folder.name}</div>
                              </div>
                              {canManageAccess && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
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
                                      Folder Access
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct Project Documents (no folder) */}
              {documentsForProject.filter(doc => !doc.folder_id).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Files className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Project Documents</h2>
                      <p className="text-sm text-muted-foreground">
                        Documents not organized in folders ({documentsForProject.filter(doc => !doc.folder_id).length} documents)
                      </p>
                    </div>
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
                <div className="text-center py-20">
                  <div className="p-6 rounded-full bg-muted/30 w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <Files className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">No Documents Found</h3>
                  <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
                    Start by uploading your first completion document or creating folders to organize your files.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {canCreateFolders && (
                      <Button variant="outline" size="lg" onClick={() => setShowCreateFolderModal(true)}>
                        <FolderPlus className="h-5 w-5 mr-2" />
                        Create Folder
                      </Button>
                    )}
                    <Button size="lg" onClick={() => setShowUploadModal(true)}>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Folder Content View
            <div className="space-y-6">
              <CompletionDocsList
                documents={filteredDocuments}
                loading={false}
                onViewDocument={setSelectedDocument}
              />
              
              {filteredDocuments.length === 0 && (
                <div className="text-center py-20">
                  <div className="p-6 rounded-full bg-muted/30 w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <Files className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">
                    {searchTerm || selectedCategory !== 'all' ? 'No Matching Documents' : 'Empty Folder'}
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'This folder is empty. Upload documents to get started.'
                    }
                  </p>
                  {(!searchTerm && selectedCategory === 'all') && (
                    <Button size="lg" onClick={() => setShowUploadModal(true)}>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        open={showCreateFolderModal}
        onOpenChange={setShowCreateFolderModal}
        onCreateFolder={handleCreateFolder}
        currentFolderName={currentFolderData?.name}
      />

      <CompletionDocsUpload
        isOpen={showUploadModal}
        teamId={teamId}
        projectId={selectedProject}
        folderId={currentFolderId}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={() => {
          setShowUploadModal(false);
          refetch();
        }}
      />

      {selectedDocument && (
        <CompletionDocsViewer
          isOpen={!!selectedDocument}
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}


      <FolderAccessModal
        isOpen={showFolderAccessModal}
        onClose={() => setShowFolderAccessModal(false)}
        folderId={selectedFolderForAccess || ''}
        teamId={teamId}
        folderName={currentFolderData?.name || ''}
      />
    </div>
  );
}

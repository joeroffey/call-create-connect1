import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Building, Award, Shield, FileCheck, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTeamProjects } from '@/hooks/useTeamProjects';
import { useCompletionDocuments } from '@/hooks/useCompletionDocuments';
import { useTeamCompletionDocuments } from '@/hooks/useTeamCompletionDocuments';
import { CompletionDocsUpload } from './CompletionDocsUpload';
import { CompletionDocsViewer } from './CompletionDocsViewer';
import { CompletionDocsList } from './CompletionDocsList';

interface TeamCompletionDocsViewProps {
  teamId: string;
}

const categoryIcons = {
  'building-control': Building,
  'certificates': Award,
  'warranties': Shield,
  'approved-documents': FileCheck,
  'other': FileText,
};

const categoryLabels = {
  'building-control': 'Building Control',
  'certificates': 'Certificates',
  'warranties': 'Warranties',
  'approved-documents': 'Approved Documents',
  'other': 'Other',
};

export const TeamCompletionDocsView = ({ teamId }: TeamCompletionDocsViewProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const { projects: teamProjects, loading: projectsLoading } = useTeamProjects(teamId);
  const { data: completionDocs, isLoading: docsLoading, refetch: refetchProjectDocs } = useCompletionDocuments(selectedProject);
  const { getDocumentCountForProject, refetch: refetchTeamDocs } = useTeamCompletionDocuments(teamId);

  // Filter projects to only show team projects (those with team_id)
  const filteredProjects = teamProjects?.filter(project => project.team_id === teamId) || [];

  const filteredDocs = completionDocs?.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getDocumentCounts = (projectId: string) => {
    return getDocumentCountForProject(projectId);
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
      <div className="space-y-6 p-4 md:p-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Completion Documents</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Manage building control documents, certificates, warranties and other completion documents for your team projects
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search team projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No Team Projects Found</h3>
              <p className="text-muted-foreground">
                Completion documents are only available for team projects. Create a team project first to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects
              .filter(project => 
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((project, index) => {
                const docCount = getDocumentCounts(project.id);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <Badge variant="secondary" className="px-2 py-1">
                            {docCount} docs
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {project.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>Team Project</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            View Docs →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  const selectedProjectData = filteredProjects.find(p => p.id === selectedProject);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 mb-4"
        >
          ← Back to Projects
        </Button>
        
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {selectedProjectData?.name}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Building control documents, certificates, warranties and important project completion files
            </p>
          </div>
          
          <Button 
            onClick={() => setShowUpload(true)} 
            className="w-full sm:w-auto flex items-center gap-2 justify-center"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Documents</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <CompletionDocsList
        documents={filteredDocs}
        loading={docsLoading}
        onViewDocument={setSelectedDocument}
      />

      {/* Upload Modal */}
      {showUpload && (
        <CompletionDocsUpload
          projectId={selectedProject}
          teamId={teamId}
          onClose={() => setShowUpload(false)}
          onUploadComplete={() => {
            setShowUpload(false);
            // Refresh both project documents and team document counts
            refetchProjectDocs();
            refetchTeamDocs();
          }}
        />
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <CompletionDocsViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};
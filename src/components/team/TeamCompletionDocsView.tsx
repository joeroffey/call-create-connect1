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
  const { data: completionDocs, isLoading: docsLoading } = useCompletionDocuments(selectedProject);

  // Filter projects to only show team projects (those with team_id)
  const filteredProjects = teamProjects?.filter(project => project.team_id === teamId) || [];

  const filteredDocs = completionDocs?.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getDocumentCounts = (projectId: string) => {
    return completionDocs?.filter(doc => doc.project_id === projectId).length || 0;
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Completion Documents</h2>
            <p className="text-muted-foreground">
              Manage building control documents, certificates, warranties and other completion documents for team projects
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Team Projects Found</h3>
              <p className="text-muted-foreground">
                Completion documents are only available for team projects. Create a team project first.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects
              .filter(project => 
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((project) => {
                const docCount = getDocumentCounts(project.id);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <Badge variant="secondary">{docCount} docs</Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Building className="w-4 h-4" />
                            <span>Team Project</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Docs
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedProject(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Projects
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedProjectData?.name} - Completion Documents
            </h2>
            <p className="text-muted-foreground">
              Building control documents, certificates, warranties and important project completion files
            </p>
          </div>
        </div>
        <Button onClick={() => setShowUpload(true)} className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Documents</span>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
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

      <CompletionDocsList
        documents={filteredDocs}
        loading={docsLoading}
        onViewDocument={setSelectedDocument}
      />

      {showUpload && (
        <CompletionDocsUpload
          projectId={selectedProject}
          teamId={teamId}
          onClose={() => setShowUpload(false)}
          onUploadComplete={() => {
            setShowUpload(false);
            // Refresh documents list
          }}
        />
      )}

      {selectedDocument && (
        <CompletionDocsViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};
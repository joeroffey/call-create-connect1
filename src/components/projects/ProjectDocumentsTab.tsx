import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectDocumentsTabProps {
  project: any;
  user: any;
}

const ProjectDocumentsTab = ({ project, user }: ProjectDocumentsTabProps) => {
  const handleNavigateToDocuments = () => {
    // Navigate to the dedicated documents page
    if (project.team_id) {
      // Team project - go to team documents
      window.location.hash = `#team-documents/${project.team_id}/${project.id}`;
    } else {
      // Personal project - go to personal documents
      window.location.hash = `#personal-documents/${project.id}`;
    }
    window.postMessage({ type: 'NAVIGATE_TO_WORKSPACE', hash: project.team_id ? `team-documents/${project.team_id}/${project.id}` : `personal-documents/${project.id}` }, '*');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Project Documents</h3>
          <p className="text-muted-foreground mt-1">Manage documents, drawings, and files for this project</p>
        </div>
        <Button
          onClick={handleNavigateToDocuments}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          <FolderOpen className="w-5 h-5 mr-2" />
          Open Documents
        </Button>
      </div>

      {/* Document Management Info */}
      <div className="bg-card/30 backdrop-blur border border-border/30 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-foreground mb-4">Smart Document Management</h4>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Organize all your building regulation documents with intelligent categorization. 
              Upload, search, and manage Architectural Drawings, Completion Documents, Project Photos, 
              Receipts, and create custom folders. Keep your team aligned with easy document sharing 
              and version control.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 text-foreground">
                <Upload className="w-5 h-5 text-primary" />
                <span className="font-medium">Upload Files</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <FolderOpen className="w-5 h-5 text-primary" />
                <span className="font-medium">Organize Folders</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-medium">Auto Categorize</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Plus className="w-5 h-5 text-primary" />
                <span className="font-medium">Custom Folders</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/50">
          <Button
            onClick={handleNavigateToDocuments}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Open Full Document Manager
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsTab;
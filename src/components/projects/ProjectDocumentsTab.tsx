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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Project Documents</h3>
          <p className="text-gray-400 text-sm">Manage documents, drawings, and files for this project</p>
        </div>
        <Button
          onClick={handleNavigateToDocuments}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Open Documents
        </Button>
      </div>

      {/* Document Management Info */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-white mb-2">Smart Document Management</h4>
            <p className="text-gray-400 text-sm mb-4">
              Organize all your building regulation documents with intelligent categorization. 
              Upload, search, and manage Architectural Drawings, Completion Documents, Project Photos, 
              Receipts, and create custom folders. Keep your team aligned with easy document sharing 
              and version control.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload Files
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                Organize Folders
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FileText className="w-4 h-4 text-emerald-400" />
                Auto Categorize
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Plus className="w-4 h-4 text-emerald-400" />
                Custom Folders
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800/50">
          <Button
            onClick={handleNavigateToDocuments}
            variant="outline"
            className="w-full"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Open Full Document Manager
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsTab;
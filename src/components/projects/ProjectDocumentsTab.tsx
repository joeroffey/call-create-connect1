import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, FolderOpen, Plus, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectDocumentsTabProps {
  project: any;
  user: any;
}

const ProjectDocumentsTab = ({ project, user }: ProjectDocumentsTabProps) => {
  const handleNavigateToDocuments = () => {
    try {
      // Navigate to the dedicated documents page
      const hash = project.team_id 
        ? `team-documents/${project.team_id}/${project.id}`
        : `personal-documents/${project.id}`;
      
      // Update the URL hash
      window.location.hash = `#${hash}`;
      
      // Post message to parent window for navigation
      window.postMessage({ 
        type: 'NAVIGATE_TO_WORKSPACE', 
        hash: hash,
        project: project
      }, '*');
      
      // Additional navigation method for robustness
      const event = new CustomEvent('navigate-to-documents', {
        detail: { 
          projectId: project.id, 
          teamId: project.team_id,
          hash: hash
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error navigating to documents:', error);
    }
  };

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Project Documents</h3>
          <p className="text-muted-foreground mt-1">
            Manage all your building regulation documents and files
          </p>
        </div>
        <Button
          onClick={handleNavigateToDocuments}
          className="bg-primary hover:bg-primary/90 shadow-md"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Open Documents
        </Button>
      </div>

      {/* Document Management Hub */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-foreground mb-4">
              Smart Document Management System
            </h4>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Organize all your building regulation documents with intelligent categorization. 
              Upload architectural drawings, completion certificates, project photos, receipts, 
              and create custom folders. Keep your team aligned with easy document sharing 
              and version control.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="flex items-center gap-3 text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-medium">Smart Upload</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-green-500" />
                </div>
                <span className="font-medium">Auto Organize</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <span className="font-medium">AI Categorize</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-orange-500" />
                </div>
                <span className="font-medium">Custom Folders</span>
              </motion.div>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-muted/30 rounded-xl p-4">
                <h5 className="font-medium text-foreground mb-2">Building Regulation Documents</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Building control applications</li>
                  <li>• Completion certificates</li>
                  <li>• Inspection reports</li>
                </ul>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4">
                <h5 className="font-medium text-foreground mb-2">Project Assets</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Architectural drawings</li>
                  <li>• Progress photos</li>
                  <li>• Receipts & invoices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-8 pt-8 border-t border-border">
          <Button
            onClick={handleNavigateToDocuments}
            size="lg"
            variant="outline"
            className="w-full hover:bg-primary hover:text-primary-foreground transition-colors group"
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Open Full Document Manager
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsTab;
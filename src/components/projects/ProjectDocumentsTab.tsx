import React from 'react';
import PersonalDocumentsView from '../personal/PersonalDocumentsView';

interface ProjectDocumentsTabProps {
  project: any;
  user: any;
}

const ProjectDocumentsTab = ({ project, user }: ProjectDocumentsTabProps) => {
  return (
    <div className="h-full">
      <PersonalDocumentsView 
        userId={user.id} 
        preSelectedProjectId={project.id}
      />
    </div>
  );
};

export default ProjectDocumentsTab;
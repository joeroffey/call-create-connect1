import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useTeamProjects } from '@/hooks/useTeamProjects';
import ProjectDiscussionView from './ProjectDiscussionView';

interface TeamDiscussionsViewProps {
  teamId: string;
  preSelectedProjectId?: string | null;
}

export default function TeamDiscussionsView({ teamId, preSelectedProjectId }: TeamDiscussionsViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use team projects hook to get available projects
  const { projects: teamProjects, loading: projectsLoading } = useTeamProjects(teamId, 'Team');
  
  // Auto-select project if preSelectedProjectId is provided
  useEffect(() => {
    if (preSelectedProjectId && teamProjects.length > 0) {
      const project = teamProjects.find(p => p.id === preSelectedProjectId);
      if (project) {
        setSelectedProject(preSelectedProjectId);
      }
    }
  }, [preSelectedProjectId, teamProjects]);

  // Filter projects based on search term
  const filteredProjects = teamProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If a project is selected, show the project discussion view
  if (selectedProject) {
    const project = teamProjects.find(p => p.id === selectedProject);
    return (
      <ProjectDiscussionView
        projectId={selectedProject}
        teamId={teamId}
        projectName={project?.name || 'Project'}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Team Discussions
          </h2>
          <p className="text-gray-400 mt-1">
            Select a project to start or join discussions with your team
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm ? 'No projects found' : 'No projects available'}
            </h3>
            <p className="text-sm text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create a project first to start team discussions'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-emerald-500/50 transition-all cursor-pointer h-full"
                  onClick={() => setSelectedProject(project.id)}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                            project.status === 'on-hold' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {project.status || 'Unknown'}
                        </Badge>
                      </div>
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </div>

                    {project.customer_name && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <p className="text-gray-400 text-xs">
                          Client: {project.customer_name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
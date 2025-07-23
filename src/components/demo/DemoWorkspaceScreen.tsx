import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, FileText, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DemoWorkspaceScreenProps {
  user: any;
  subscriptionTier: string;
  onViewPlans: () => void;
  onStartNewChat: (projectId: string) => void;
}

const DemoWorkspaceScreen = ({ user, subscriptionTier, onViewPlans, onStartNewChat }: DemoWorkspaceScreenProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const demoProjects = [
    {
      id: 'demo-1',
      name: 'Victorian House Extension',
      description: 'Single story rear extension with kitchen renovation',
      status: 'In Progress',
      progress: 65,
      conversations: 8,
      documents: 12,
      lastActivity: '2 hours ago'
    },
    {
      id: 'demo-2', 
      name: 'Loft Conversion',
      description: 'Converting loft space into bedroom with ensuite',
      status: 'Planning',
      progress: 25,
      conversations: 3,
      documents: 5,
      lastActivity: '1 day ago'
    },
    {
      id: 'demo-3',
      name: 'Garden Office Build',
      description: 'Detached garden office with planning permission',
      status: 'Completed',
      progress: 100,
      conversations: 15,
      documents: 28,
      lastActivity: '1 week ago'
    }
  ];

  if (selectedProject) {
    const project = demoProjects.find(p => p.id === selectedProject);
    
    return (
      <div className="h-full bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProject(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Projects
            </Button>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">{project?.name}</h2>
            <p className="text-gray-400 text-sm mb-4">{project?.description}</p>
            <Badge 
              variant={project?.status === 'Completed' ? 'default' : 'secondary'}
              className="mb-6"
            >
              {project?.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <Card className="bg-gray-900/40 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-white font-medium">Chat with AI</h3>
                      <p className="text-gray-400 text-sm">{project?.conversations} conversations</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onStartNewChat(selectedProject)}>
                    Open Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">Documents</h3>
                      <p className="text-gray-400 text-sm">{project?.documents} files uploaded</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Docs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-white font-medium">Schedule</h3>
                      <p className="text-gray-400 text-sm">Project timeline & tasks</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="text-white font-medium mb-3">Project Progress</h3>
            <div className="bg-gray-800 rounded-full h-2 mb-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project?.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{project?.progress}% Complete</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-white">My Projects</h1>
            <p className="text-gray-400 text-sm">Manage your building projects</p>
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </motion.div>

        {/* Projects List */}
        <div className="space-y-3">
          {demoProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-gray-900/40 border-gray-700 hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedProject(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{project.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span>{project.conversations} chats</span>
                      <span>{project.documents} docs</span>
                    </div>
                    <Badge 
                      variant={project.status === 'Completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-3">
                    <div className="bg-gray-800 rounded-full h-1.5">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 mt-6"
        >
          <h3 className="text-white font-medium mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoWorkspaceScreen;
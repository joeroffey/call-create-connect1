import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConversations } from '../../hooks/useConversations';
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsModal from '../ProjectDetailsModal';
import ProjectCard from '../projects/ProjectCard';
import CreateProjectModal from '../projects/CreateProjectModal';
import EditProjectModal from '../projects/EditProjectModal';
import EmptyProjectsState from '../projects/EmptyProjectsState';

interface TeamProject {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
  team_id: string;
  team_name: string;
}

interface TeamProjectsViewProps {
  user: any;
  teamId: string;
  teamName: string;
  onStartNewChat: (projectId: string, conversationId?: string) => void;
}

const TeamProjectsView = ({ user, teamId, teamName, onStartNewChat }: TeamProjectsViewProps) => {
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', label: 'Residential' });
  const [editingProject, setEditingProject] = useState<TeamProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<TeamProject | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const { toast } = useToast();
  
  console.log('TeamProjectsView render - user:', user?.id, 'teamId:', teamId, 'projects:', projects.length);
  
  // Get conversations data with the new helper functions
  const conversationsHook = useConversations(user?.id);
  const { 
    conversations, 
    getProjectConversationCount, 
    getProjectDocumentCount,
    getProjectScheduleOfWorksCount,
    loading: conversationsLoading,
    incrementDocumentCount,
    incrementScheduleCount
  } = conversationsHook;

  console.log('TeamProjectsView - conversations loaded:', conversations.length);

  const fetchTeamProjects = async () => {
    if (!user?.id || !teamId) {
      console.log('No user ID or team ID, skipping project fetch');
      setLoading(false);
      return;
    }
    
    console.log('Fetching team projects for user:', user.id, 'teamId:', teamId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          teams!left(
            id,
            name
          )
        `)
        .eq('team_id', teamId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching team projects:', error);
        throw error;
      }
      
      console.log('TeamProjectsView - fetched team projects:', data);
      
      // Process projects to include team name
      const processedProjects = (data || []).map(project => ({
        ...project,
        team_name: teamName // Use the passed team name for consistency
      }));
      
      // Sort projects: pinned first, then by updated_at
      const sortedProjects = processedProjects.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setProjects(sortedProjects);
      console.log('Team projects set successfully:', sortedProjects.length);
    } catch (error) {
      console.error('Error fetching team projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading team projects",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('TeamProjectsView useEffect triggered, user ID:', user?.id, 'teamId:', teamId);
    fetchTeamProjects();
  }, [user?.id, teamId]);

  // Set up real-time subscription for team projects
  useEffect(() => {
    if (!user?.id || !teamId) return;

    console.log('Setting up real-time subscription for team projects');
    const channel = supabase
      .channel('team-projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log('Team project change detected:', payload);
          fetchTeamProjects();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up team projects subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, teamId]);

  const togglePinProject = async (projectId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ pinned: !currentPinned })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: !currentPinned ? "Project pinned" : "Project unpinned",
        description: !currentPinned ? "Project moved to top of list" : "Project unpinned from top",
      });

      fetchTeamProjects();
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      const statusLabel = newStatus === 'setup' ? 'Set-up' : newStatus.replace('-', ' ');
      toast({
        title: "Status updated",
        description: `Project status changed to ${statusLabel}.`,
      });

      fetchTeamProjects();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message || "Please try again.",
      });
    }
  };

  const createProject = async () => {
    if (!user?.id || !newProject.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            team_id: teamId,
            name: newProject.name.trim(),
            description: newProject.description.trim() || null,
            label: newProject.label,
            status: 'setup'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Team project created successfully",
        description: `${newProject.name} has been added to ${teamName}.`,
      });

      setNewProject({ name: '', description: '', label: 'Residential' });
      setShowCreateModal(false);
      fetchTeamProjects();
    } catch (error: any) {
      console.error('Error creating team project:', error);
      toast({
        variant: "destructive",
        title: "Error creating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const updateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name.trim(),
          description: editingProject.description.trim() || null,
          label: editingProject.label,
          status: editingProject.status
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      toast({
        title: "Project updated successfully",
        description: `${editingProject.name} has been updated.`,
      });

      setEditingProject(null);
      fetchTeamProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        variant: "destructive",
        title: "Error updating project",
        description: error.message || "Please try again.",
      });
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated conversations and documents.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: `${projectName} has been deleted.`,
      });

      fetchTeamProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error deleting project",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleProjectStatsClick = (project: TeamProject, section: string) => {
    console.log('handleProjectStatsClick called with:', project.name, section);
    setSelectedProject(project);
    setActiveTab(section);
    setShowProjectDetails(true);
    console.log('Modal should now be open with activeTab:', section);
  };

  const handleEditProject = (project: any) => {
    // Convert the project from ProjectCard format to TeamProject format
    const teamProject: TeamProject = {
      ...project,
      team_id: project.team_id || teamId,
      team_name: project.team_name || teamName
    };
    setEditingProject(teamProject);
  };

  const handleStartNewChatFromModal = (projectId: string, conversationId?: string) => {
    console.log('Starting chat for project:', projectId, 'conversation:', conversationId);
    if (conversationId) {
      // Open existing conversation
      onStartNewChat(projectId, conversationId);
    } else {
      // Start new chat for project
      onStartNewChat(projectId);
    }
  };

  if (loading || conversationsLoading) {
    console.log('Team projects loading - projects loading:', loading, 'conversations loading:', conversationsLoading);
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  console.log('Rendering team projects view with', projects.length, 'projects');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Team Projects</h3>
          <p className="text-gray-400 mt-1">Collaborate on building regulation projects with {teamName}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Team Project</span>
        </motion.button>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No team projects yet</h3>
            <p className="text-sm text-gray-400 mb-6">Create your first team project to start collaborating</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Team Project</span>
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                conversationCount={getProjectConversationCount(project.id)}
                documentCount={getProjectDocumentCount(project.id)}
                scheduleOfWorksCount={getProjectScheduleOfWorksCount(project.id)}
                onStartNewChat={onStartNewChat}
                onEdit={handleEditProject}
                onDelete={deleteProject}
                onTogglePin={togglePinProject}
                onProjectStatsClick={handleProjectStatsClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal - Pass the shared hook */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={showProjectDetails}
        onClose={() => {
          console.log('Closing ProjectDetailsModal');
          setShowProjectDetails(false);
          setSelectedProject(null);
        }}
        onStartNewChat={handleStartNewChatFromModal}
        user={user}
        initialTab={activeTab}
        conversationsHook={conversationsHook}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newProject={newProject}
        setNewProject={setNewProject}
        onCreateProject={createProject}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        editingProject={editingProject}
        onClose={() => setEditingProject(null)}
        setEditingProject={(project) => {
          if (project) {
            const teamProject: TeamProject = {
              ...project,
              team_id: (project as any).team_id || teamId,
              team_name: (project as any).team_name || teamName
            };
            setEditingProject(teamProject);
          } else {
            setEditingProject(null);
          }
        }}
        onUpdateProject={updateProject}
      />
    </div>
  );
};

export default TeamProjectsView;
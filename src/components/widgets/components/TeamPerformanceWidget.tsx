import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, MessageSquare, Share2 } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  completedTasks: number;
  sharedDocuments: number;
  collaborationScore: number;
}

interface TeamPerformanceWidgetProps extends BaseWidgetProps {
  teamId?: string;
}

const TeamPerformanceWidget: React.FC<TeamPerformanceWidgetProps> = ({ teamId, ...props }) => {
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    completedTasks: 0,
    sharedDocuments: 0,
    collaborationScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      fetchTeamStats();
    }
  }, [teamId]);

  const fetchTeamStats = async () => {
    if (!teamId) return;

    try {
      // Get team members
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      // Get team projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('team_id', teamId);

      const projectIds = projects?.map(p => p.id) || [];

      // Get completed tasks in team projects
      const { data: completedTasks } = await supabase
        .from('project_schedule_of_works')
        .select('id')
        .in('project_id', projectIds)
        .eq('completed', true);

      // Get shared documents
      const { data: documents } = await supabase
        .from('project_completion_documents')
        .select('id')
        .in('project_id', projectIds);

      // Get recent team activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentActivity } = await supabase
        .from('team_activity')
        .select('user_id')
        .eq('team_id', teamId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const totalMembers = members?.length || 0;
      const activeMembers = new Set(recentActivity?.map(a => a.user_id) || []).size;
      const completedTasksCount = completedTasks?.length || 0;
      const sharedDocuments = documents?.length || 0;
      
      // Simple collaboration score based on activity
      const collaborationScore = totalMembers > 0 
        ? Math.round((activeMembers / totalMembers) * 100)
        : 0;

      setStats({
        totalMembers,
        activeMembers,
        completedTasks: completedTasksCount,
        sharedDocuments,
        collaborationScore
      });

    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!teamId) {
    return (
      <BaseWidget
        {...props}
        title="Team Performance"
        icon={Users}
      >
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Select a team to view performance</p>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget
      {...props}
      title="Team Performance"
      icon={Users}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.collaborationScore}%</div>
            <div className="text-sm text-gray-400">Team Activity Score</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-semibold text-white">{stats.activeMembers}/{stats.totalMembers}</div>
              <div className="text-xs text-gray-400">Active Members</div>
            </div>
            
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="font-semibold text-white">{stats.completedTasks}</div>
              <div className="text-xs text-gray-400">Tasks Done</div>
            </div>
            
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Share2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="font-semibold text-white">{stats.sharedDocuments}</div>
              <div className="text-xs text-gray-400">Documents</div>
            </div>
            
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="w-4 h-4 text-orange-400" />
              </div>
              <div className="font-semibold text-white">--</div>
              <div className="text-xs text-gray-400">Comments</div>
            </div>
          </div>

          {/* Activity indicator */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.collaborationScore}%` }}
            />
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default TeamPerformanceWidget;
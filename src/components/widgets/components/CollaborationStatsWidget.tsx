import React, { useEffect, useState } from 'react';
import { MessageSquare, Share2, Users, Activity } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface CollaborationStats {
  totalComments: number;
  recentComments: number;
  sharedDocuments: number;
  activeMembers: number;
  collaborationScore: number;
}

interface CollaborationStatsWidgetProps extends BaseWidgetProps {
  teamId?: string;
}

const CollaborationStatsWidget: React.FC<CollaborationStatsWidgetProps> = ({ teamId, ...props }) => {
  const [stats, setStats] = useState<CollaborationStats>({
    totalComments: 0,
    recentComments: 0,
    sharedDocuments: 0,
    activeMembers: 0,
    collaborationScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborationStats();
  }, [teamId]);

  const fetchCollaborationStats = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (teamId) {
        // Team-specific stats
        const [commentsResult, documentsResult, membersResult, activityResult] = await Promise.all([
          // Total comments in team
          supabase
            .from('comments')
            .select('id, created_at')
            .eq('team_id', teamId),
          
          // Shared documents in team projects
          supabase
            .from('project_completion_documents')
            .select('id')
            .eq('team_id', teamId),
          
          // Team members
          supabase
            .from('team_members')
            .select('user_id')
            .eq('team_id', teamId),
          
          // Recent team activity
          supabase
            .from('team_activity')
            .select('user_id')
            .eq('team_id', teamId)
            .gte('created_at', weekAgo.toISOString())
        ]);

        const totalComments = commentsResult.data?.length || 0;
        const recentComments = commentsResult.data?.filter(c => 
          new Date(c.created_at) > weekAgo
        ).length || 0;
        const sharedDocuments = documentsResult.data?.length || 0;
        const totalMembers = membersResult.data?.length || 0;
        const activeMembers = new Set(activityResult.data?.map(a => a.user_id) || []).size;
        
        const collaborationScore = totalMembers > 0 
          ? Math.round(((activeMembers / totalMembers) * 0.4 + (recentComments > 0 ? 0.6 : 0)) * 100)
          : 0;

        setStats({
          totalComments,
          recentComments,
          sharedDocuments,
          activeMembers,
          collaborationScore
        });
      } else {
        // Personal workspace - user's own collaboration activity
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const [commentsResult, documentsResult] = await Promise.all([
          // User's comments
          supabase
            .from('comments')
            .select('id, created_at')
            .eq('author_id', user.user.id),
          
          // User's document uploads
          supabase
            .from('project_completion_documents')
            .select('id')
            .eq('uploaded_by', user.user.id)
        ]);

        const totalComments = commentsResult.data?.length || 0;
        const recentComments = commentsResult.data?.filter(c => 
          new Date(c.created_at) > weekAgo
        ).length || 0;
        const sharedDocuments = documentsResult.data?.length || 0;

        setStats({
          totalComments,
          recentComments,
          sharedDocuments,
          activeMembers: 1,
          collaborationScore: recentComments > 0 ? 75 : 25
        });
      }
    } catch (error) {
      console.error('Error fetching collaboration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseWidget
      {...props}
      title="Collaboration Stats"
      icon={MessageSquare}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.collaborationScore}%</div>
            <div className="text-sm text-gray-400">Collaboration Score</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-semibold text-white">{stats.totalComments}</div>
              <div className="text-xs text-gray-400">Total Comments</div>
            </div>

            <div className="text-center p-2 bg-gray-800/30 rounded">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="font-semibold text-white">{stats.recentComments}</div>
              <div className="text-xs text-gray-400">This Week</div>
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
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <div className="font-semibold text-white">{stats.activeMembers}</div>
              <div className="text-xs text-gray-400">{teamId ? 'Active Members' : 'You'}</div>
            </div>
          </div>

          {/* Collaboration indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Engagement Level</span>
              <span className={`font-medium ${
                stats.collaborationScore >= 75 ? 'text-green-400' :
                stats.collaborationScore >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {stats.collaborationScore >= 75 ? 'High' :
                 stats.collaborationScore >= 50 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.collaborationScore >= 75 ? 'bg-green-500' :
                  stats.collaborationScore >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${stats.collaborationScore}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default CollaborationStatsWidget;
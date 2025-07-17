import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, MessageSquare } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface TeamStats {
  memberCount: number;
  activeProjects: number;
  completedTasks: number;
  totalComments: number;
  topPerformers: Array<{
    name: string;
    tasksCompleted: number;
  }>;
}

const TeamPerformanceWidget: React.FC<BaseWidgetProps> = (props) => {
  const [stats, setStats] = useState<TeamStats>({
    memberCount: 0,
    activeProjects: 0,
    completedTasks: 0,
    totalComments: 0,
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const fetchTeamStats = async () => {
    try {
      setLoading(true);
      // This would be populated with actual team data
      // For now, showing placeholder data structure
      setStats({
        memberCount: 5,
        activeProjects: 3,
        completedTasks: 24,
        totalComments: 156,
        topPerformers: [
          { name: 'Alex Smith', tasksCompleted: 8 },
          { name: 'Sarah Johnson', tasksCompleted: 6 },
          { name: 'Mike Brown', tasksCompleted: 5 }
        ]
      });
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseWidget {...props} title="Team Performance" icon={Users}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props} title="Team Performance" icon={Users}>
      <div className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-400">{stats.memberCount}</div>
            <div className="text-xs text-gray-400">Members</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">{stats.activeProjects}</div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{stats.completedTasks}</div>
            <div className="text-xs text-gray-400">Tasks Done</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">{stats.totalComments}</div>
            <div className="text-xs text-gray-400">Comments</div>
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Top Performers</span>
          </div>
          <div className="space-y-2">
            {stats.topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm text-white">{performer.name}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {performer.tasksCompleted} tasks
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Indicator */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">Team Activity</span>
            </div>
            <div className="text-sm text-emerald-400">High</div>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default TeamPerformanceWidget;
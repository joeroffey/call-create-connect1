import React, { useEffect, useState } from 'react';
import { Bookmark, Pin, ExternalLink } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface PinnedProject {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

const NavigationShortcutsWidget: React.FC<BaseWidgetProps> = (props) => {
  const [pinnedProjects, setPinnedProjects] = useState<PinnedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPinnedProjects();
  }, []);

  const fetchPinnedProjects = async () => {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status, updated_at')
        .eq('pinned', true)
        .order('updated_at', { ascending: false })
        .limit(4);

      setPinnedProjects(projects || []);
    } catch (error) {
      console.error('Error fetching pinned projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-emerald-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'planning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const quickActions = [
    { label: 'New Project', icon: '📁', href: '/projects/new' },
    { label: 'Dashboard', icon: '📊', href: '/dashboard' },
    { label: 'Team', icon: '👥', href: '/teams' },
    { label: 'Reports', icon: '📈', href: '/reports' }
  ];

  return (
    <BaseWidget
      {...props}
      title="Navigation Shortcuts"
      icon={Bookmark}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned Projects */}
          {pinnedProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Pinned Projects</span>
              </div>
              <div className="space-y-1">
                {pinnedProjects.map(project => (
                  <Button
                    key={project.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2 text-left"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                      <span className="text-sm text-gray-300 truncate flex-1">
                        {project.name}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {quickActions.map(action => (
                <Button
                  key={action.label}
                  variant="ghost"
                  className="h-auto p-2 flex flex-col items-center gap-1 border border-gray-700 hover:border-gray-600"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-xs text-gray-300">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {pinnedProjects.length === 0 && (
            <div className="text-center py-4">
              <Pin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No pinned projects</p>
              <p className="text-gray-500 text-xs mt-1">Pin projects for quick access</p>
            </div>
          )}
        </div>
      )}
    </BaseWidget>
  );
};

export default NavigationShortcutsWidget;
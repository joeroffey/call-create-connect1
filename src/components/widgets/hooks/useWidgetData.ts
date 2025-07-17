import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WidgetLayout, WorkspaceType } from '../types';

export const useWidgetData = (userId: string, teamId?: string, workspaceType: WorkspaceType = 'personal') => {
  const [widgets, setWidgets] = useState<WidgetLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_widget_preferences')
        .select('widget_layout')
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType)
        .eq('team_id', teamId || null)
        .maybeSingle();

      if (error) throw error;

      if (data?.widget_layout) {
        setWidgets(data.widget_layout as unknown as WidgetLayout[]);
      } else {
        // Set default widgets for new users
        const defaultWidgets = getDefaultWidgets(workspaceType);
        setWidgets(defaultWidgets);
      }
    } catch (err) {
      console.error('Error fetching widgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  const saveWidgets = async (newWidgets: WidgetLayout[]) => {
    try {
      const { error } = await supabase
        .from('user_widget_preferences')
        .upsert({
          user_id: userId,
          team_id: teamId || null,
          workspace_type: workspaceType,
          widget_layout: newWidgets as unknown as any
        }, {
          onConflict: 'user_id,team_id,workspace_type'
        });

      if (error) throw error;
      setWidgets(newWidgets);
    } catch (err) {
      console.error('Error saving widgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to save widgets');
    }
  };

  const addWidget = (widget: WidgetLayout) => {
    const newWidgets = [...widgets, widget];
    saveWidgets(newWidgets);
  };

  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    saveWidgets(newWidgets);
  };

  const updateWidget = (widgetId: string, updates: Partial<WidgetLayout>) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    saveWidgets(newWidgets);
  };

  useEffect(() => {
    if (userId) {
      fetchWidgets();
    }
  }, [userId, teamId, workspaceType]);

  return {
    widgets,
    loading,
    error,
    addWidget,
    removeWidget,
    updateWidget,
    saveWidgets
  };
};

const getDefaultWidgets = (workspaceType: WorkspaceType): WidgetLayout[] => {
  if (workspaceType === 'personal') {
    return [
      {
        id: 'project-stats',
        type: 'project-stats',
        position: { x: 0, y: 0 },
        size: 'medium',
        config: { refreshRate: 'hour', dataRange: 'all' }
      },
      {
        id: 'task-performance',
        type: 'task-performance',
        position: { x: 2, y: 0 },
        size: 'medium',
        config: { refreshRate: 'hour', dataRange: 'week' }
      },
      {
        id: 'quick-create',
        type: 'quick-create',
        position: { x: 0, y: 1 },
        size: 'medium',
        config: { refreshRate: 'manual' }
      },
      {
        id: 'upcoming-deadlines',
        type: 'upcoming-deadlines',
        position: { x: 2, y: 1 },
        size: 'medium',
        config: { refreshRate: 'hour', dataRange: 'week' }
      }
    ];
  }

  // Team workspace widgets
  return [
    {
      id: 'project-stats',
      type: 'project-stats',
      position: { x: 0, y: 0 },
      size: 'medium',
      config: { refreshRate: 'hour', dataRange: 'all' }
    },
    {
      id: 'task-performance',
      type: 'task-performance',
      position: { x: 2, y: 0 },
      size: 'medium',
      config: { refreshRate: 'hour', dataRange: 'week' }
    },
    {
      id: 'recent-activity',
      type: 'recent-activity',
      position: { x: 0, y: 1 },
      size: 'large',
      config: { refreshRate: 'realtime', dataRange: 'week' }
    },
    {
      id: 'quick-create',
      type: 'quick-create',
      position: { x: 2, y: 1 },
      size: 'medium',
      config: { refreshRate: 'manual' }
    },
    {
      id: 'team-performance',
      type: 'team-performance',
      position: { x: 0, y: 2 },
      size: 'wide',
      config: { refreshRate: 'hour', dataRange: 'week' }
    }
  ];
};
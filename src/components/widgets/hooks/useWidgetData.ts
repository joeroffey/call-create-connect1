
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WidgetLayout, WorkspaceType } from '../types';

export const useWidgetData = (userId: string, teamId?: string, workspaceType: WorkspaceType = 'personal') => {
  const [widgets, setWidgets] = useState<WidgetLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching widgets for:', { userId, teamId, workspaceType });
      
      const { data, error } = await supabase
        .from('user_widget_preferences')
        .select('widget_layout')
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType)
        .eq('team_id', teamId || null)
        .maybeSingle();

      if (error) {
        console.error('Error fetching widgets:', error);
        throw error;
      }

      console.log('Fetched widget data:', data);

      if (data?.widget_layout) {
        setWidgets(data.widget_layout as unknown as WidgetLayout[]);
      } else {
        // Set default widgets for new users
        const defaultWidgets = getDefaultWidgets(workspaceType);
        console.log('Setting default widgets:', defaultWidgets);
        setWidgets(defaultWidgets);
      }
    } catch (err) {
      console.error('Error in fetchWidgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setLoading(false);
    }
  }, [userId, teamId, workspaceType]);

  const saveWidgets = useCallback(async (newWidgets: WidgetLayout[]) => {
    try {
      console.log('Saving widgets:', { userId, teamId, workspaceType, newWidgets });
      
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

      if (error) {
        console.error('Error saving widgets:', error);
        throw error;
      }
      
      console.log('Successfully saved widgets');
      setWidgets(newWidgets);
    } catch (err) {
      console.error('Error in saveWidgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to save widgets');
    }
  }, [userId, teamId, workspaceType]);

  const addWidget = useCallback((widget: WidgetLayout) => {
    console.log('Adding widget:', widget);
    const newWidgets = [...widgets, widget];
    saveWidgets(newWidgets);
  }, [widgets, saveWidgets]);

  const removeWidget = useCallback((widgetId: string) => {
    console.log('Removing widget:', widgetId);
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    saveWidgets(newWidgets);
  }, [widgets, saveWidgets]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetLayout>) => {
    console.log('Updating widget:', widgetId, updates);
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    saveWidgets(newWidgets);
  }, [widgets, saveWidgets]);

  useEffect(() => {
    if (userId) {
      fetchWidgets();
    }
  }, [fetchWidgets]);

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

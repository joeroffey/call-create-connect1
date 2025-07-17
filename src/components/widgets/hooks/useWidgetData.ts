
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
      
      // Normalize teamId - handle all possible null-like values
      const normalizedTeamId = (!teamId || teamId === "null" || teamId === "" || teamId === "undefined") ? null : teamId;
      
      console.log('🔍 Fetching widgets with normalized teamId:', normalizedTeamId, 'userId:', userId);
      
      // First, let's see all records for this user to debug
      const debugQuery = supabase
        .from('user_widget_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType);
      
      const { data: allRecords } = await debugQuery;
      console.log('🔍 All records for user:', allRecords);
      
      let query = supabase
        .from('user_widget_preferences')
        .select('widget_layout')
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType);
      
      if (normalizedTeamId === null) {
        query = query.is('team_id', null);
      } else {
        query = query.eq('team_id', normalizedTeamId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      console.log('🔍 Fetch query result:', { data, error });

      if (error) {
        throw error;
      }

      if (data?.widget_layout && Array.isArray(data.widget_layout)) {
        console.log('🔍 Found saved widget layout with', data.widget_layout.length, 'widgets');
        setWidgets(data.widget_layout as unknown as WidgetLayout[]);
      } else {
        console.log('🔍 No saved layout found, using defaults');
        // Set default widgets for new users
        const defaultWidgets = getDefaultWidgets(workspaceType);
        setWidgets(defaultWidgets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
      // Set default widgets on error
      const defaultWidgets = getDefaultWidgets(workspaceType);
      setWidgets(defaultWidgets);
    } finally {
      setLoading(false);
    }
  }, [userId, teamId, workspaceType]);

  const saveWidgets = useCallback(async (newWidgets: WidgetLayout[]) => {
    try {      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('💾 User authenticated:', user.id, 'Provided userId:', userId);
      
      // Verify userId matches authenticated user
      if (user.id !== userId) {
        throw new Error('User ID mismatch - authentication issue');
      }
      
      // Normalize teamId - handle all possible null-like values
      const normalizedTeamId = (!teamId || teamId === "null" || teamId === "" || teamId === "undefined") ? null : teamId;
      
      console.log('💾 Saving widgets with normalized teamId:', normalizedTeamId, 'Widget count:', newWidgets.length);
      
      // First, delete any existing record with detailed error checking
      const deleteQuery = supabase
        .from('user_widget_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType);
      
      if (normalizedTeamId === null) {
        deleteQuery.is('team_id', null);
      } else {
        deleteQuery.eq('team_id', normalizedTeamId);
      }
      
      const deleteResult = await deleteQuery;
      
      if (deleteResult.error) {
        console.error('💾 Delete error details:', deleteResult.error);
        throw deleteResult.error;
      }
      
      console.log('💾 Delete result:', deleteResult);
      
      // Insert new record with detailed error checking
      const insertResult = await supabase
        .from('user_widget_preferences')
        .insert({
          user_id: userId,
          team_id: normalizedTeamId,
          workspace_type: workspaceType,
          widget_layout: newWidgets as unknown as any
        });

      if (insertResult.error) {
        console.error('💾 Insert error details:', insertResult.error);
        throw insertResult.error;
      }
      
      console.log('💾 Insert result:', insertResult);
      console.log('💾 Successfully saved widgets to database');
      
      // Update local state
      setWidgets(newWidgets);
      setError(null);
      
    } catch (err) {
      console.error('💾 Detailed error saving widgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to save widgets');
      throw err;
    }
  }, [userId, teamId, workspaceType]);

  const addWidget = useCallback(async (widget: WidgetLayout) => {
    const newWidgets = [...widgets, widget];
    
    try {
      await saveWidgets(newWidgets);
    } catch (error) {
      // Error handling is done in saveWidgets
    }
  }, [widgets, saveWidgets]);

  const removeWidget = useCallback(async (widgetId: string) => {
    console.log('🗑️ Removing widget:', widgetId, 'Current widgets count:', widgets.length);
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    console.log('🗑️ New widgets count after filter:', newWidgets.length);
    
    try {
      console.log('🗑️ Calling saveWidgets with new widgets...');
      await saveWidgets(newWidgets);
      console.log('🗑️ Widget removal successful');
    } catch (error) {
      console.error('🗑️ Error removing widget:', error);
      // Error handling is done in saveWidgets
    }
  }, [widgets, saveWidgets]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<WidgetLayout>) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    
    try {
      await saveWidgets(newWidgets);
    } catch (error) {
      // Error handling is done in saveWidgets
    }
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
    saveWidgets,
    refetch: fetchWidgets
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

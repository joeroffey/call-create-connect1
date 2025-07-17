
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
      console.log('🔍 Fetching widgets for:', { userId, teamId, workspaceType });
      
      const { data, error } = await supabase
        .from('user_widget_preferences')
        .select('widget_layout')
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType)
        .eq('team_id', teamId || null)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching widgets:', error);
        throw error;
      }

      console.log('📊 Raw widget data from database:', data);

      if (data?.widget_layout && Array.isArray(data.widget_layout) && data.widget_layout.length > 0) {
        console.log('✅ Found existing widgets:', data.widget_layout);
        setWidgets(data.widget_layout as unknown as WidgetLayout[]);
      } else {
        // Set default widgets for new users
        const defaultWidgets = getDefaultWidgets(workspaceType);
        console.log('🎯 Setting default widgets:', defaultWidgets);
        setWidgets(defaultWidgets);
      }
    } catch (err) {
      console.error('💥 Error in fetchWidgets:', err);
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
      console.log('💾 Attempting to save widgets:', { 
        userId, 
        teamId, 
        workspaceType, 
        widgetCount: newWidgets.length,
        widgets: newWidgets 
      });
      
      // First, try to update existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('user_widget_preferences')
        .select('id')
        .eq('user_id', userId)
        .eq('workspace_type', workspaceType)
        .eq('team_id', teamId || null)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error checking existing preferences:', fetchError);
      }

      console.log('🔍 Existing preference record:', existingData);

      let saveResult;
      
      if (existingData) {
        // Update existing record
        console.log('🔄 Updating existing record with ID:', existingData.id);
        saveResult = await supabase
          .from('user_widget_preferences')
          .update({
            widget_layout: newWidgets as unknown as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
      } else {
        // Insert new record
        console.log('➕ Creating new preference record');
        saveResult = await supabase
          .from('user_widget_preferences')
          .insert({
            user_id: userId,
            team_id: teamId || null,
            workspace_type: workspaceType,
            widget_layout: newWidgets as unknown as any
          });
      }

      if (saveResult.error) {
        console.error('❌ Error saving widgets:', saveResult.error);
        throw saveResult.error;
      }
      
      console.log('✅ Successfully saved widgets, result:', saveResult);
      
      // Update local state
      setWidgets(newWidgets);
      
      // Verify the save by fetching the data back
      setTimeout(async () => {
        console.log('🔍 Verifying save by fetching data back...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_widget_preferences')
          .select('widget_layout')
          .eq('user_id', userId)
          .eq('workspace_type', workspaceType)
          .eq('team_id', teamId || null)
          .maybeSingle();
        
        if (verifyError) {
          console.error('❌ Error verifying save:', verifyError);
        } else {
          console.log('✅ Verification result:', verifyData);
          if (verifyData?.widget_layout) {
            console.log('📊 Verified widget count:', (verifyData.widget_layout as any[]).length);
          }
        }
      }, 1000);
      
    } catch (err) {
      console.error('💥 Error in saveWidgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to save widgets');
      throw err;
    }
  }, [userId, teamId, workspaceType]);

  const addWidget = useCallback(async (widget: WidgetLayout) => {
    console.log('➕ Adding widget:', widget);
    const newWidgets = [...widgets, widget];
    console.log('📊 New widgets array will have', newWidgets.length, 'widgets');
    
    try {
      await saveWidgets(newWidgets);
      console.log('✅ Widget added successfully');
    } catch (error) {
      console.error('❌ Failed to add widget:', error);
    }
  }, [widgets, saveWidgets]);

  const removeWidget = useCallback(async (widgetId: string) => {
    console.log('🗑️ Removing widget:', widgetId);
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    console.log('📊 New widgets array will have', newWidgets.length, 'widgets');
    
    try {
      await saveWidgets(newWidgets);
      console.log('✅ Widget removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove widget:', error);
    }
  }, [widgets, saveWidgets]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<WidgetLayout>) => {
    console.log('🔄 Updating widget:', widgetId, updates);
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    
    try {
      await saveWidgets(newWidgets);
      console.log('✅ Widget updated successfully');
    } catch (error) {
      console.error('❌ Failed to update widget:', error);
    }
  }, [widgets, saveWidgets]);

  useEffect(() => {
    if (userId) {
      console.log('🚀 useWidgetData effect triggered for userId:', userId);
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
  console.log('🎯 Getting default widgets for workspace type:', workspaceType);
  
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

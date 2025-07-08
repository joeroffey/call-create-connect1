import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  user_id: string;
  assigned_to?: string;
}

export const useProjectSchedule = (projectId: string | undefined, userId: string | undefined) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  const fetchScheduleItems = async () => {
    if (!projectId || !userId) {
      setScheduleItems([]);
      return;
    }

    setLoading(true);
    try {
      // First check if this is a team project or personal project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('team_id, user_id')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      let query = supabase
        .from('project_schedule_of_works')
        .select('*')
        .eq('project_id', projectId);

      // For personal projects (no team_id), filter by user_id
      // For team projects, show schedule items from all team members
      if (!project.team_id) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setScheduleItems(data || []);
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      toast({
        variant: "destructive",
        title: "Error loading schedule",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskInput: {
    title: string;
    description?: string;
    due_date?: string;
    assigned_to?: string;
  }) => {
    if (!projectId || !userId) {
      toast({
        variant: "destructive",
        title: "Create failed",
        description: "Project and user information required.",
      });
      return false;
    }

    if (!taskInput.title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a task title.",
      });
      return false;
    }

    setSaving(true);
    try {
      const insertData: any = {
        title: taskInput.title.trim(),
        project_id: projectId,
        user_id: userId
      };

      if (taskInput.description?.trim()) {
        insertData.description = taskInput.description.trim();
      }

      if (taskInput.due_date) {
        insertData.due_date = taskInput.due_date;
      }

      if (taskInput.assigned_to) {
        insertData.assigned_to = taskInput.assigned_to;
      }

      const { data: newTask, error } = await supabase
        .from('project_schedule_of_works')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // If task is assigned to someone, create task assignment and notification
      if (taskInput.assigned_to && newTask) {
        // First get the project's team_id
        const { data: project } = await supabase
          .from('projects')
          .select('team_id')
          .eq('id', projectId)
          .single();

        if (project?.team_id) {
          // Create task assignment
          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert([{
              task_id: newTask.id,
              assigned_to: taskInput.assigned_to,
              assigned_by: userId,
              team_id: project.team_id
            }]);

          if (assignmentError) {
            console.error('Error creating task assignment:', assignmentError);
            // Don't fail the task creation if assignment fails
          }

          // Create notification for task assignment
          try {
            await supabase.rpc('create_task_assignment_notification', {
              p_task_id: newTask.id,
              p_assigned_to: taskInput.assigned_to,
              p_assigned_by: userId,
              p_project_id: projectId,
              p_team_id: project.team_id,
              p_task_title: taskInput.title
            });
          } catch (notificationError) {
            console.error('Error creating task assignment notification:', notificationError);
            // Don't fail the task creation if notification fails
          }
        }
      }

      toast({
        title: 'Task created',
        description: 'Task has been added to your schedule.',
      });

      // Refresh schedule items
      await fetchScheduleItems();
      return true;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error creating task',
        description: error.message || 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .update({ 
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      // Optimistic update
      setScheduleItems(prev => prev.map(item => 
        item.id === taskId 
          ? { 
              ...item, 
              completed: !completed,
              completed_at: !completed ? new Date().toISOString() : null
            }
          : item
      ));

      toast({
        title: !completed ? 'Task completed' : 'Task reopened',
        description: !completed ? 'Task marked as completed.' : 'Task marked as incomplete.',
      });
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast({
        title: 'Error updating task',
        description: error.message || 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
      // Refresh to get accurate state
      fetchScheduleItems();
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task deleted",
        description: "Task has been removed from your schedule.",
      });

      // Refresh schedule items
      await fetchScheduleItems();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete task. Please try again.",
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<ScheduleItem>) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });

      // Refresh schedule items
      await fetchScheduleItems();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update task. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchScheduleItems();
  }, [projectId, userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId || !userId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel
    const channelName = `project-schedule-${projectId}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_schedule_of_works',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Schedule change detected:', payload);
          fetchScheduleItems();
        }
      );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId, userId]);

  return {
    scheduleItems,
    loading,
    saving,
    createTask,
    toggleTaskCompletion,
    deleteTask,
    updateTask,
    refreshSchedule: fetchScheduleItems
  };
};
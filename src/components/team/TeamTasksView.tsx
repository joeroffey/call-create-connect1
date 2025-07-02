import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TeamTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  project_id: string;
  project_name: string;
  created_at: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
}

interface TeamTasksViewProps {
  teamId: string;
  teamName: string;
}

const TeamTasksView = ({ teamId, teamName }: TeamTasksViewProps) => {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamTasks = async () => {
    if (!teamId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_schedule_of_works')
        .select(`
          id,
          title,
          description,
          due_date,
          completed,
          project_id,
          created_at,
          assigned_to,
          projects!inner(
            id,
            name,
            team_id
          )
        `)
        .eq('projects.team_id', teamId)
        .eq('completed', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get assigned user names for tasks that have assignments
      const assignedUserIds = (data || [])
        .map(task => task.assigned_to)
        .filter(Boolean) as string[];

      const { data: profiles } = assignedUserIds.length > 0 
        ? await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', assignedUserIds)
        : { data: [] };

      const processedTasks = (data || []).map(task => {
        const assignedProfile = profiles?.find(p => p.user_id === task.assigned_to);
        return {
          ...task,
          project_name: task.projects?.name || 'Unknown Project',
          assigned_to_name: assignedProfile?.full_name || null
        };
      });

      setTasks(processedTasks);
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      toast({
        variant: "destructive",
        title: "Error loading tasks",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamTasks();
  }, [teamId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!teamId) return;

    const channel = supabase
      .channel('team-tasks-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_schedule_of_works'
      }, () => {
        fetchTeamTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const markTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_schedule_of_works')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task completed",
        description: "Task has been marked as complete.",
      });

      fetchTeamTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        variant: "destructive",
        title: "Error completing task",
        description: "Please try again.",
      });
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-400', urgent: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-400', urgent: true };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-400', urgent: false };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-400', urgent: false };
    } else {
      return { text: `Due ${date.toLocaleDateString()}`, color: 'text-gray-400', urgent: false };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white">Active Tasks</h3>
        <p className="text-gray-400 mt-1">
          {tasks.length} active tasks across {teamName} projects
        </p>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No active tasks</h3>
          <p className="text-sm text-gray-400">All team tasks are completed!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const dueDateInfo = formatDueDate(task.due_date);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all ${dueDateInfo?.urgent ? 'border-l-4 border-l-red-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Row 1: Title + Complete button */}
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-lg font-semibold text-white truncate flex-1" title={task.title}>
                          {task.title}
                        </h4>
                        <Button
                          onClick={() => markTaskComplete(task.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      </div>
                      
                      {/* Row 2: Project badge + Due date */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 hover:bg-emerald-600/30 px-2 py-1 text-sm">
                          {task.project_name}
                        </Badge>
                        
                        {dueDateInfo && (
                          <div className={`flex items-center gap-2 ${dueDateInfo.color} text-sm`}>
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{dueDateInfo.text}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Row 3: Assigned to + Created date */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {task.assigned_to_name ? (
                          <Badge variant="outline" className="px-2 py-1 text-sm text-blue-400 border-blue-400/30">
                            <User className="w-3 h-3 mr-1" />
                            {task.assigned_to_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-2 py-1 text-sm text-gray-400 border-gray-400/30">
                            <User className="w-3 h-3 mr-1" />
                            Unassigned
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <div className="border-t border-gray-700/50 pt-3 mt-3">
                          <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamTasksView;
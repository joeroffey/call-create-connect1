import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectPhase {
  id: string;
  project_id: string;
  team_id: string;
  phase_name: string;
  start_date: string;
  end_date: string;
  description?: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  color: string;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useProjectPlan = (projectId: string | undefined, teamId: string | undefined) => {
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchPhases = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_plan_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPhases((data || []) as ProjectPhase[]);
    } catch (error: any) {
      console.error('Error fetching project phases:', error);
      toast({
        title: "Error",
        description: "Failed to load project phases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPhase = async (phaseData: {
    phase_name: string;
    start_date: string;
    end_date: string;
    description?: string;
    color?: string;
  }) => {
    if (!projectId || !teamId) return false;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('project_plan_phases')
        .insert({
          project_id: projectId,
          team_id: teamId,
          phase_name: phaseData.phase_name,
          start_date: phaseData.start_date,
          end_date: phaseData.end_date,
          description: phaseData.description,
          color: phaseData.color || '#3b82f6',
          order_index: phases.length,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select()
        .single();

      if (error) throw error;

      setPhases(prev => [...prev, data as ProjectPhase]);
      toast({
        title: "Success",
        description: "Project phase created successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating phase:', error);
      toast({
        title: "Error",
        description: "Failed to create project phase",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePhase = async (phaseId: string, updates: Partial<ProjectPhase>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');

      // Get current phase data for comparison
      const { data: currentPhase } = await supabase
        .from('project_plan_phases')
        .select('status, phase_name, project_id, team_id')
        .eq('id', phaseId)
        .single();

      const { data, error } = await supabase
        .from('project_plan_phases')
        .update(updates)
        .eq('id', phaseId)
        .select()
        .single();

      if (error) throw error;

      setPhases(prev => prev.map(phase => 
        phase.id === phaseId ? { ...phase, ...data } as ProjectPhase : phase
      ));

      // Trigger notification for status change if status was updated
      if (currentPhase && updates.status && currentPhase.status !== updates.status) {
        try {
          await supabase.rpc('create_phase_status_notification', {
            p_phase_id: phaseId,
            p_project_id: currentPhase.project_id,
            p_changed_by: user.id,
            p_team_id: currentPhase.team_id,
            p_old_status: currentPhase.status,
            p_new_status: updates.status,
            p_phase_name: currentPhase.phase_name
          });
        } catch (notifError) {
          console.warn('Failed to create phase status notification:', notifError);
        }
      }

      toast({
        title: "Success",
        description: "Project phase updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating phase:', error);
      toast({
        title: "Error",
        description: "Failed to update project phase",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePhase = async (phaseId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('project_plan_phases')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;

      setPhases(prev => prev.filter(phase => phase.id !== phaseId));
      toast({
        title: "Success",
        description: "Project phase deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      toast({
        title: "Error",
        description: "Failed to delete project phase",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generatePlan = async (projectName: string, projectDescription?: string, projectType?: string) => {
    if (!projectId || !teamId) return false;

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-plan', {
        body: {
          projectId,
          projectName,
          projectDescription,
          projectType,
        },
      });

      if (error) throw error;

      // Create phases from AI-generated plan
      const generatedPhases = data.phases;
      let currentDate = new Date();
      
      for (let i = 0; i < generatedPhases.length; i++) {
        const phase = generatedPhases[i];
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + phase.duration_days - 1);

        await createPhase({
          phase_name: phase.phase_name,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          description: phase.description,
          color: `hsl(${(i * 60) % 360}, 70%, 50%)`, // Generate different colors
        });

        // Move to next phase start date (with 1 day buffer)
        currentDate = new Date(endDate);
        currentDate.setDate(currentDate.getDate() + 2);
      }

      toast({
        title: "Success",
        description: "AI-generated project plan created successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error generating project plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate project plan",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, [projectId]);

  // Real-time updates
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('project-plan-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_plan_phases',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchPhases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    phases,
    loading,
    saving,
    createPhase,
    updatePhase,
    deletePhase,
    generatePlan,
    refetch: fetchPhases,
  };
};
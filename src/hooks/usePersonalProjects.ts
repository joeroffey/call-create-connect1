import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PersonalProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  label: string | null;
  pinned: boolean;
}

export const usePersonalProjects = (userId: string | undefined) => {
  const [projects, setProjects] = useState<PersonalProject[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!userId) {
      setProjects([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .is('team_id', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching personal projects:', error);
      toast({
        variant: "destructive",
        title: "Error loading projects",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const refetch = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    refetch
  };
};
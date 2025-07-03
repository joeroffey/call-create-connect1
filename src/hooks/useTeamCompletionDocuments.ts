import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type CompletionDocument } from './useCompletionDocuments';

export const useTeamCompletionDocuments = (teamId?: string | null) => {
  const [data, setData] = useState<CompletionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamDocuments = async () => {
    if (!teamId) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: documents, error: fetchError } = await supabase
        .from('project_completion_documents')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(documents || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team completion documents';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentCountForProject = (projectId: string) => {
    return data.filter(doc => doc.project_id === projectId).length;
  };

  const getDocumentsByProject = (projectId: string) => {
    return data.filter(doc => doc.project_id === projectId);
  };

  useEffect(() => {
    fetchTeamDocuments();
  }, [teamId]);

  return {
    data,
    isLoading,
    error,
    getDocumentCountForProject,
    getDocumentsByProject,
    refetch: fetchTeamDocuments,
  };
};
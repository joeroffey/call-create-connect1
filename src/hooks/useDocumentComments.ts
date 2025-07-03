import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentComment {
  id: string;
  content: string;
  author_id: string;
  team_id: string;
  target_id: string;
  target_type: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
  replies?: DocumentComment[];
}

export const useDocumentComments = (documentId: string, teamId: string) => {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!documentId || !teamId) {
      setComments([]);
      setCommentCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('team_id', teamId)
        .eq('target_type', 'completion_document')
        .eq('target_id', documentId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Comments query error:', commentsError);
        setError(commentsError.message);
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }

      setCommentCount(commentsData.length);

      // Get unique author IDs
      const authorIds = [...new Set(commentsData.map(c => c.author_id))];
      
      // Get profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', authorIds);

      // Create profiles lookup
      const profilesLookup = new Map();
      profilesData?.forEach(profile => {
        profilesLookup.set(profile.user_id, profile);
      });

      // Process comments
      const commentsMap = new Map<string, DocumentComment>();
      const rootComments: DocumentComment[] = [];

      commentsData.forEach((comment: any) => {
        const profile = profilesLookup.get(comment.author_id);
        const processedComment: DocumentComment = {
          id: comment.id,
          content: comment.content,
          author_id: comment.author_id,
          team_id: comment.team_id,
          target_id: comment.target_id,
          target_type: comment.target_type,
          parent_id: comment.parent_id,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          author_name: profile?.full_name || 'Unknown User',
          replies: []
        };
        
        commentsMap.set(comment.id, processedComment);

        if (!comment.parent_id) {
          rootComments.push(processedComment);
        }
      });

      // Add replies to their parent comments
      commentsData.forEach((comment: any) => {
        if (comment.parent_id) {
          const parentComment = commentsMap.get(comment.parent_id);
          const childComment = commentsMap.get(comment.id);
          
          if (parentComment && childComment) {
            parentComment.replies?.push(childComment);
          }
        }
      });

      setComments(rootComments);
      
    } catch (error) {
      console.error('Error fetching document comments:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setComments([]);
      setCommentCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!documentId || !teamId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          team_id: teamId,
          target_id: documentId,
          target_type: 'completion_document',
          parent_id: parentId || null,
          author_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });

      fetchComments();
    } catch (error) {
      console.error('Error adding document comment:', error);
      toast({
        variant: "destructive",
        title: "Error adding comment",
        description: "Please try again.",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });

      fetchComments();
    } catch (error) {
      console.error('Error deleting document comment:', error);
      toast({
        variant: "destructive",
        title: "Error deleting comment",
        description: "Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [documentId, teamId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!documentId || !teamId) return;

      const channelName = `document-comments-${documentId}-${teamId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `target_id=eq.${documentId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, teamId]);

  return {
    comments: comments || [],
    commentCount: commentCount || 0,
    loading: Boolean(loading),
    error,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
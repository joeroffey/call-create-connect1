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
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!documentId || !teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('team_id', teamId)
        .eq('target_type', 'completion_document')
        .eq('target_id', documentId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }

      setCommentCount(commentsData.length);

      // Get unique author IDs
      const authorIds = [...new Set(commentsData.map(c => c.author_id))];
      
      // Get profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', authorIds);

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      // Create profiles lookup
      const profilesLookup = new Map();
      profilesData?.forEach(profile => {
        profilesLookup.set(profile.user_id, profile);
      });

      // Organize comments into threads
      const commentsMap = new Map<string, DocumentComment>();
      const rootComments: DocumentComment[] = [];

      commentsData.forEach((comment: any) => {
        const profile = profilesLookup.get(comment.author_id);
        const processedComment: DocumentComment = {
          ...comment,
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
        if (comment.parent_id && commentsMap.has(comment.parent_id)) {
          const parentComment = commentsMap.get(comment.parent_id);
          const childComment = commentsMap.get(comment.id);
          if (parentComment && childComment) {
            parentComment.replies!.push(childComment);
          }
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching document comments:', error);
      toast({
        variant: "destructive",
        title: "Error loading comments",
        description: "Please try again later.",
      });
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

    const channel = supabase
      .channel('document-comments-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `team_id=eq.${teamId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, teamId]);

  return {
    comments,
    commentCount,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
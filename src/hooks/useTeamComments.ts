import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  team_id: string;
  target_id: string;
  target_type: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
  };
  replies?: Comment[];
}

export const useTeamComments = (teamId: string | null, targetType: 'team' | 'project', targetId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!teamId) return;

    setLoading(true);
    try {
      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('team_id', teamId)
        .eq('target_type', targetType)
        .eq('target_id', targetType === 'team' ? teamId : (targetId || ''))
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Then get profiles for all authors
      const authorIds = [...new Set(commentsData?.map(c => c.author_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', authorIds);

      if (profilesError) throw profilesError;

      // Create profiles lookup
      const profilesLookup = new Map();
      profilesData?.forEach(profile => {
        profilesLookup.set(profile.user_id, profile);
      });

      // Combine comments with profiles
      const data = commentsData?.map(comment => ({
        ...comment,
        profiles: profilesLookup.get(comment.author_id)
      }));

      // Organize comments into threads
      const commentsMap = new Map();
      const rootComments: Comment[] = [];

      (data || []).forEach((comment: any) => {
        const commentWithReplies = { ...comment, replies: [] };
        commentsMap.set(comment.id, commentWithReplies);

        if (!comment.parent_id) {
          rootComments.push(commentWithReplies);
        }
      });

      // Add replies to their parent comments
      (data || []).forEach((comment: any) => {
        if (comment.parent_id && commentsMap.has(comment.parent_id)) {
          const parentComment = commentsMap.get(comment.parent_id);
          const commentWithReplies = commentsMap.get(comment.id);
          parentComment.replies.push(commentWithReplies);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
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
    if (!teamId) return;

    try {
      const commentTargetId = targetType === 'team' ? teamId : targetId;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          team_id: teamId,
          target_id: commentTargetId,
          target_type: targetType,
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
      console.error('Error adding comment:', error);
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
      console.error('Error deleting comment:', error);
      toast({
        variant: "destructive",
        title: "Error deleting comment",
        description: "Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [teamId, targetType, targetId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!teamId) return;

    const channel = supabase
      .channel('team-comments-realtime')
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
  }, [teamId]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
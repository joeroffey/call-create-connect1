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
  author_name?: string;
  replies?: Comment[];
}

export const useTeamComments = (teamId: string | null, targetType: 'team' | 'project', targetId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const commentTargetId = targetType === 'team' ? teamId : (targetId || '');
      console.log('Fetching comments for:', { teamId, targetType, commentTargetId });
      
      // First, get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('team_id', teamId)
        .eq('target_type', targetType)
        .eq('target_id', commentTargetId)
        .order('created_at', { ascending: true });

      console.log('Comments query result:', { commentsData, commentsError });
      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        console.log('No comments found');
        setComments([]);
        setLoading(false);
        return;
      }

      // Get unique author IDs
      const authorIds = [...new Set(commentsData.map(c => c.author_id))];
      console.log('Author IDs:', authorIds);
      
      // Get profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', authorIds);

      console.log('Profiles query result:', { profilesData, profilesError });
      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      // Create profiles lookup
      const profilesLookup = new Map();
      profilesData?.forEach(profile => {
        profilesLookup.set(profile.user_id, profile);
      });

      // Organize comments into threads
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      commentsData.forEach((comment: any) => {
        const profile = profilesLookup.get(comment.author_id);
        const processedComment: Comment = {
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

      console.log('Final processed comments:', rootComments);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');
      
      const commentTargetId = targetType === 'team' ? teamId : targetId;
      
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          team_id: teamId,
          target_id: commentTargetId,
          target_type: targetType,
          parent_id: parentId || null,
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the team
      if (newComment) {
        try {
          const { error: notificationError } = await supabase.rpc('create_comment_notification', {
            p_comment_id: newComment.id,
            p_author_id: user.id,
            p_team_id: teamId,
            p_target_id: commentTargetId,
            p_target_type: targetType,
            p_content: content.trim()
          });
          
          if (notificationError) {
            console.warn('Failed to create comment notification:', notificationError);
            // Don't throw here as the comment was successfully created
          }
        } catch (notificationError) {
          console.warn('Error creating comment notification:', notificationError);
          // Don't throw here as the comment was successfully created
        }
      }

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
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
      setComments([]);
      setCommentCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching comments for document:', documentId, 'team:', teamId);
      
      // Get comments with comprehensive error handling
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('team_id', teamId)
        .eq('target_type', 'completion_document')
        .eq('target_id', documentId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Comments query error:', commentsError);
        throw commentsError;
      }

      console.log('Comments data:', commentsData?.length || 0, 'comments found');

      if (!commentsData || commentsData.length === 0) {
        console.log('No comments found, setting empty state');
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }

      setCommentCount(commentsData.length);

      // Get unique author IDs with null check
      const authorIds = [...new Set(
        commentsData
          .map(c => c?.author_id)
          .filter(id => id != null)
      )];
      
      console.log('Fetching profiles for author IDs:', authorIds);
      
      // Get profiles for all authors with fallback
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', authorIds);

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        // Don't throw, continue with empty profiles
      }

      console.log('Profiles data:', profilesData?.length || 0, 'profiles found');

      // Create profiles lookup with safety checks
      const profilesLookup = new Map();
      if (profilesData && Array.isArray(profilesData)) {
        profilesData.forEach(profile => {
          if (profile?.user_id) {
            profilesLookup.set(profile.user_id, profile);
          }
        });
      }

      // Organize comments into threads with comprehensive safety checks
      const commentsMap = new Map<string, DocumentComment>();
      const rootComments: DocumentComment[] = [];

      commentsData.forEach((comment: any) => {
        if (!comment?.id) {
          console.warn('Skipping comment with missing ID:', comment);
          return;
        }

        try {
          const profile = profilesLookup.get(comment.author_id);
          const processedComment: DocumentComment = {
            id: comment.id,
            content: comment.content || '',
            author_id: comment.author_id || '',
            team_id: comment.team_id || '',
            target_id: comment.target_id || '',
            target_type: comment.target_type || '',
            parent_id: comment.parent_id || null,
            created_at: comment.created_at || new Date().toISOString(),
            updated_at: comment.updated_at || new Date().toISOString(),
            author_name: profile?.full_name || 'Unknown User',
            replies: []
          };
          
          commentsMap.set(comment.id, processedComment);

          if (!comment.parent_id) {
            rootComments.push(processedComment);
          }
        } catch (commentError) {
          console.error('Error processing comment:', comment.id, commentError);
        }
      });

      // Add replies to their parent comments with safety checks
      commentsData.forEach((comment: any) => {
        if (!comment?.id || !comment?.parent_id) return;
        
        try {
          if (commentsMap.has(comment.parent_id)) {
            const parentComment = commentsMap.get(comment.parent_id);
            const childComment = commentsMap.get(comment.id);
            if (parentComment && childComment && parentComment.replies) {
              parentComment.replies.push(childComment);
            }
          }
        } catch (replyError) {
          console.error('Error processing reply:', comment.id, replyError);
        }
      });

      console.log('Processed comments:', rootComments.length, 'root comments');
      setComments(rootComments);
    } catch (error) {
      console.error('Critical error fetching document comments:', error);
      // Set safe fallback state
      setComments([]);
      setCommentCount(0);
      toast({
        variant: "destructive",
        title: "Error loading comments",
        description: "Comments could not be loaded. The document is still viewable.",
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
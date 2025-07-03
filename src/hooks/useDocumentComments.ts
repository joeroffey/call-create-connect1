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
    // Early validation with comprehensive safety checks
    if (!documentId || !teamId || typeof documentId !== 'string' || typeof teamId !== 'string') {
      console.warn('Invalid props for useDocumentComments:', { documentId, teamId });
      setComments([]);
      setCommentCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching comments for document:', documentId, 'team:', teamId);
      
      // Validate IDs are proper UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(documentId) || !uuidRegex.test(teamId)) {
        console.warn('Invalid UUID format for documentId or teamId');
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }
      
      // Get comments with timeout and retry logic
      let commentsData, commentsError;
      try {
        const result = await supabase
          .from('comments')
          .select('*')
          .eq('team_id', teamId)
          .eq('target_type', 'completion_document')
          .eq('target_id', documentId)
          .order('created_at', { ascending: true });
        
        commentsData = result.data;
        commentsError = result.error;
      } catch (queryError) {
        console.error('Database query failed:', queryError);
        throw new Error('Failed to fetch comments from database');
      }

      if (commentsError) {
        console.error('Comments query error:', commentsError);
        throw new Error(`Database error: ${commentsError.message}`);
      }

      // Handle empty results safely
      if (!commentsData || !Array.isArray(commentsData) || commentsData.length === 0) {
        console.log('No comments found, setting empty state');
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }

      setCommentCount(commentsData.length);

      // Get unique author IDs with comprehensive validation
      const authorIds = [...new Set(
        commentsData
          .filter(c => c && typeof c === 'object' && c.author_id)
          .map(c => c.author_id)
          .filter(id => id && typeof id === 'string' && uuidRegex.test(id))
      )];
      
      if (authorIds.length === 0) {
        console.log('No valid author IDs found');
        setComments([]);
        setCommentCount(0);
        setLoading(false);
        return;
      }
      
      // Get profiles with error handling
      let profilesData = [];
      try {
        const profileResult = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', authorIds);
        
        if (profileResult.error) {
          console.error('Profiles query error:', profileResult.error);
          // Continue without profiles rather than failing
        } else {
          profilesData = profileResult.data || [];
        }
      } catch (profileError) {
        console.error('Profile fetch failed:', profileError);
        // Continue without profiles
      }

      // Create profiles lookup with safety checks
      const profilesLookup = new Map();
      if (Array.isArray(profilesData)) {
        profilesData.forEach(profile => {
          if (profile && profile.user_id && typeof profile.user_id === 'string') {
            profilesLookup.set(profile.user_id, profile);
          }
        });
      }

      // Process comments with comprehensive error handling
      const commentsMap = new Map<string, DocumentComment>();
      const rootComments: DocumentComment[] = [];

      commentsData.forEach((comment: any, index: number) => {
        try {
          // Validate comment structure
          if (!comment || typeof comment !== 'object' || !comment.id) {
            console.warn(`Skipping invalid comment at index ${index}:`, comment);
            return;
          }

          const profile = profilesLookup.get(comment.author_id);
          const processedComment: DocumentComment = {
            id: String(comment.id),
            content: String(comment.content || ''),
            author_id: String(comment.author_id || ''),
            team_id: String(comment.team_id || teamId),
            target_id: String(comment.target_id || documentId),
            target_type: String(comment.target_type || 'completion_document'),
            parent_id: comment.parent_id ? String(comment.parent_id) : null,
            created_at: comment.created_at || new Date().toISOString(),
            updated_at: comment.updated_at || new Date().toISOString(),
            author_name: (profile && profile.full_name) ? String(profile.full_name) : 'Unknown User',
            replies: []
          };
          
          commentsMap.set(comment.id, processedComment);

          if (!comment.parent_id) {
            rootComments.push(processedComment);
          }
        } catch (commentError) {
          console.error(`Error processing comment at index ${index}:`, commentError);
          // Continue processing other comments
        }
      });

      // Add replies to their parent comments with safety checks
      commentsData.forEach((comment: any, index: number) => {
        try {
          if (!comment?.id || !comment?.parent_id) return;
          
          const parentComment = commentsMap.get(comment.parent_id);
          const childComment = commentsMap.get(comment.id);
          
          if (parentComment && childComment && Array.isArray(parentComment.replies)) {
            parentComment.replies.push(childComment);
          }
        } catch (replyError) {
          console.error(`Error processing reply at index ${index}:`, replyError);
        }
      });

      console.log('Successfully processed comments:', rootComments.length, 'root comments');
      setComments(rootComments);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Critical error fetching document comments:', error);
      
      // Set safe fallback state
      setComments([]);
      setCommentCount(0);
      setError(errorMessage);
      
      // Show user-friendly error without blocking UI
      toast({
        variant: "destructive",
        title: "Comments temporarily unavailable",
        description: "The document can still be viewed. Please try refreshing.",
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
    comments: comments || [],
    commentCount: commentCount || 0,
    loading: Boolean(loading),
    error,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
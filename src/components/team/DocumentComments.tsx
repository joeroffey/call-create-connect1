import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDocumentComments } from '@/hooks/useDocumentComments';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ErrorBoundary } from './ErrorBoundary';

interface DocumentCommentsProps {
  documentId: string;
  teamId: string;
  currentUserId?: string;
}

export const DocumentComments = ({ documentId, teamId, currentUserId }: DocumentCommentsProps) => {
  // Enhanced safety checks for props with detailed validation
  if (!documentId || !teamId || typeof documentId !== 'string' || typeof teamId !== 'string') {
    console.warn('DocumentComments: Invalid props provided', { 
      documentId, 
      teamId, 
      documentIdType: typeof documentId,
      teamIdType: typeof teamId 
    });
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Comments are not available for this document.</p>
      </div>
    );
  }

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Wrap hook in try-catch to prevent component crashes
  let hookResult;
  try {
    hookResult = useDocumentComments(documentId, teamId);
  } catch (error) {
    console.error('Error in useDocumentComments hook:', error);
    setComponentError(error instanceof Error ? error.message : 'Unknown error');
    hookResult = {
      comments: [],
      commentCount: 0,
      loading: false,
      addComment: async () => {},
      deleteComment: async () => {}
    };
  }
  
  const { comments, commentCount, loading, addComment, deleteComment, error } = hookResult;

  // If there's a component error, show fallback UI
  if (componentError) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Comments are temporarily unavailable.</p>
        <p className="text-xs mt-1">Error: {componentError}</p>
      </div>
    );
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Error is already handled in the hook with toast
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    await addComment(replyContent, parentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown date';
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const getInitials = (name: string) => {
    try {
      if (!name || typeof name !== 'string') return 'UN';
      return name
        .split(' ')
        .map(n => n?.[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'UN';
    } catch (error) {
      console.warn('Error getting initials for name:', name, error);
      return 'UN';
    }
  };

  return (
    <ErrorBoundary context="Document Comments" fallback={
      <div className="p-4 text-center text-muted-foreground">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Comments could not be loaded, but the document is still viewable.</p>
      </div>
    }>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 w-full justify-start"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comments</span>
            {commentCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {commentCount}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || loading}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      {/* Comment header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(comment.author_name || 'Unknown')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{comment.author_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(comment.created_at)}
                            </div>
                          </div>
                        </div>
                        {currentUserId === comment.author_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteComment(comment.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {/* Comment content */}
                      <p className="text-sm leading-relaxed">{comment.content}</p>

                      {/* Reply button */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs h-6 px-2"
                        >
                          Reply
                        </Button>
                      </div>

                      {/* Reply form */}
                      {replyingTo === comment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 ml-6"
                        >
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            className="resize-none text-sm"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyContent.trim()}
                              className="h-7 text-xs"
                            >
                              Reply
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-6 space-y-3 border-l-2 border-border pl-4">
                          {comment.replies.map((reply) => (
                            <motion.div
                              key={reply.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-2"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(reply.author_name || 'Unknown')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-xs">{reply.author_name}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-2 h-2" />
                                      {formatDate(reply.created_at)}
                                    </div>
                                  </div>
                                </div>
                                {currentUserId === reply.author_id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteComment(reply.id)}
                                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="w-2 h-2" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs leading-relaxed">{reply.content}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
    </ErrorBoundary>
  );
};
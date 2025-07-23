import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Users, Send, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamComments } from '@/hooks/useTeamComments';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDiscussionViewProps {
  projectId: string;
  teamId: string;
  projectName: string;
  onBack: () => void;
}

export default function ProjectDiscussionView({ 
  projectId, 
  teamId, 
  projectName, 
  onBack 
}: ProjectDiscussionViewProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { comments, loading, addComment, deleteComment } = useTeamComments(teamId, 'project', projectId);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Project Discussion
          </h3>
          <p className="text-gray-400 mt-1">
            {projectName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Users className="w-4 h-4" />
          {comments.length} {comments.length === 1 ? 'discussion' : 'discussions'}
        </div>
      </div>

      {/* Add New Comment */}
      <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white text-lg">Start a Discussion</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Share your thoughts about this project..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No discussions yet</h3>
          <p className="text-sm text-gray-400">Start the conversation by posting the first comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {[...comments].reverse().map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    {/* Comment header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-sm bg-gray-700 text-white">
                            {getInitials(comment.author_name || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{comment.author_name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
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
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Comment content */}
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* Reply button */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs h-7 px-3 text-gray-400 hover:text-white"
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
                        className="space-y-3 ml-4 pl-4 border-l-2 border-gray-700"
                      >
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={3}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600"
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
                            className="h-8 text-xs text-gray-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 pl-4 border-l-2 border-gray-700 space-y-4">
                        {comment.replies.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-gray-700 text-white">
                                    {getInitials(reply.author_name || 'Unknown')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-white text-sm">{reply.author_name}</p>
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
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
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
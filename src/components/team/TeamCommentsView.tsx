import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamComments } from '@/hooks/useTeamComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { supabase } from '@/integrations/supabase/client';

interface TeamCommentsViewProps {
  teamId: string;
  teamName: string;
}

const TeamCommentsView = ({ teamId, teamName }: TeamCommentsViewProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { comments, loading, addComment, deleteComment } = useTeamComments(teamId, 'team');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleAddComment = async (content: string) => {
    await addComment(content);
  };

  const handleReply = async (content: string, parentId: string) => {
    await addComment(content, parentId);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Team Discussion
          </h3>
          <p className="text-gray-400 mt-1">
            General team discussions for {teamName}
          </p>
        </div>
      </div>

      {/* Add New Comment */}
      <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white text-lg">Start a Discussion</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CommentForm onSubmit={handleAddComment} placeholder="Share your thoughts with the team..." />
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No discussions yet</h3>
          <p className="text-sm text-gray-400">Start the conversation by posting the first comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            {comments.length} {comments.length === 1 ? 'discussion' : 'discussions'}
          </div>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CommentItem
                comment={comment}
                onReply={handleReply}
                onDelete={deleteComment}
                currentUserId={currentUserId}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamCommentsView;
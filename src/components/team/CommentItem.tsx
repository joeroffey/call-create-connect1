import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Reply, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CommentForm from './CommentForm';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

const CommentItem = ({ comment, onReply, onDelete, currentUserId, level = 0 }: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleReply = async (content: string) => {
    setReplyLoading(true);
    try {
      await onReply(content, comment.id);
      setShowReplyForm(false);
    } finally {
      setReplyLoading(false);
    }
  };

  const canDelete = currentUserId === comment.author_id;
  const isNested = level > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isNested ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''}`}
    >
      <Card className="bg-gray-800/30 border-gray-700 mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {comment.profiles?.full_name?.substring(0, 2).toUpperCase() || 'UN'}
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {comment.profiles?.full_name || 'Unknown User'}
                </p>
                <p className="text-gray-400 text-xs">
                  {formatTime(comment.created_at)}
                </p>
              </div>
            </div>
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-400 hover:text-white h-7 px-2"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <span className="text-gray-500 text-xs flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <CommentForm
                onSubmit={handleReply}
                placeholder="Write a reply..."
                buttonText="Reply"
                loading={replyLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CommentItem;
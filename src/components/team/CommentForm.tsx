import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  loading?: boolean;
}

const CommentForm = ({ 
  onSubmit, 
  placeholder = "Write a comment...", 
  buttonText = "Post Comment",
  loading = false 
}: CommentFormProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-[100px] resize-none"
        disabled={loading}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
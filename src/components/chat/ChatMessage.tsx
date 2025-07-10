
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, FileText, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useMessageFeedback } from '@/hooks/useMessageFeedback';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    isWelcome?: boolean;
    images?: Array<{ url: string; title: string; source: string; }>;
    documentsAnalyzed?: number;
  };
  conversationId: string;
  isProjectChat?: boolean;
}

const ChatMessage = ({ message, conversationId, isProjectChat = false }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const { submitFeedback, getFeedback, loading } = useMessageFeedback();
  const [userFeedback, setUserFeedback] = useState<'thumbs_up' | 'thumbs_down' | null>(null);

  useEffect(() => {
    if (message.sender === 'assistant') {
      getFeedback(message.id).then((feedback) => {
        if (feedback) {
          setUserFeedback(feedback.feedback_type as 'thumbs_up' | 'thumbs_down');
        }
      });
    }
  }, [message.id, message.sender]);

  const handleFeedback = async (feedbackType: 'thumbs_up' | 'thumbs_down') => {
    const success = await submitFeedback({
      message_id: message.id,
      conversation_id: conversationId,
      feedback_type: feedbackType,
    });

    if (success) {
      setUserFeedback(feedbackType);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-4 ${
        isUser ? 'justify-end' : 'justify-start'
      } ${message.isWelcome ? 'bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 border border-emerald-500/10 rounded-lg' : ''}`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
            {isProjectChat ? (
              <Clock className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'max-w-[80%] items-end' : 'max-w-[90%] items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-emerald-500 text-white ml-auto'
              : message.isWelcome
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-100 border border-emerald-500/20'
                : 'bg-gray-800/70 text-gray-100'
          } shadow-lg backdrop-blur-sm`}
        >
          {message.sender === 'assistant' ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-emerald-300">{children}</strong>,
                  em: ({ children }) => <em className="italic text-blue-300">{children}</em>,
                  code: ({ children }) => <code className="bg-gray-700/50 px-1 py-0.5 rounded text-xs">{children}</code>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-emerald-300">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-emerald-300">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-emerald-300">{children}</h3>,
                }}
              >
                {message.text}
              </ReactMarkdown>
              {message.documentsAnalyzed !== undefined && message.documentsAnalyzed > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-600/50">
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <FileText className="w-3 h-3" />
                    <span>Analyzed {message.documentsAnalyzed} project document{message.documentsAnalyzed !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
              
              {/* Feedback buttons for assistant messages */}
              {message.sender === 'assistant' && !message.isWelcome && (
                <div className="mt-3 pt-2 border-t border-gray-600/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Was this helpful?</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback('thumbs_up')}
                        disabled={loading}
                        className={`h-6 w-6 p-0 hover:bg-emerald-500/20 ${
                          userFeedback === 'thumbs_up' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback('thumbs_down')}
                        disabled={loading}
                        className={`h-6 w-6 p-0 hover:bg-red-500/20 ${
                          userFeedback === 'thumbs_down' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;

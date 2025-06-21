
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  
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
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
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

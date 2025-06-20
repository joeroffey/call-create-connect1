
import React from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  inputText: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({ inputText, isTyping, onInputChange, onSend, onKeyPress }: ChatInputProps) => {
  return (
    <div className="border-t border-gray-800/50 p-4 flex-shrink-0 backdrop-blur-sm">
      <div className="flex items-center space-x-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask me a question..."
            className="bg-gray-900/60 border-gray-700/50 text-white placeholder-gray-400 resize-none pr-12 min-h-[48px] max-h-32 rounded-xl backdrop-blur-sm font-inter text-[15px] leading-relaxed focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-200"
            rows={1}
          />
          <Button
            onClick={onSend}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg p-0 transition-all duration-200 hover:shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 w-10 h-10 flex-shrink-0"
        >
          <Mic className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;

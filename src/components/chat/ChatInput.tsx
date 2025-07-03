
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
    <div className="border-t border-gray-800/50 p-3 sm:p-4 flex-shrink-0 backdrop-blur-sm safe-area-bottom">
      <div className="flex items-center space-x-2 sm:space-x-3 max-w-4xl mx-auto">
        <div className="flex-1 relative min-w-0">
          <Textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask me a question..."
            className="w-full bg-gray-900/60 border-gray-700/50 text-white placeholder-gray-400 resize-none pr-10 sm:pr-12 min-h-[44px] sm:min-h-[48px] max-h-32 rounded-lg sm:rounded-xl backdrop-blur-sm font-inter text-sm sm:text-[15px] leading-relaxed focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-200"
            rows={1}
          />
          <Button
            onClick={onSend}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-md sm:rounded-lg p-0 transition-all duration-200 hover:shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;

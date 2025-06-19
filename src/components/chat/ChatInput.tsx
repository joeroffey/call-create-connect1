
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
    <div className="border-t border-gray-800 p-4 flex-shrink-0">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask about UK Building Regulations..."
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 resize-none pr-12 min-h-[44px] max-h-32"
            rows={1}
          />
          <Button
            onClick={onSend}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-full"
        >
          <Mic className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;

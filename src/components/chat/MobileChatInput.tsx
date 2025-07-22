import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, Clock, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ENVIRONMENT, { useKeyboard } from '@/utils/environment';

interface MobileChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onDocumentUpload?: () => void;
  onScheduleOfWorks?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  isUploading?: boolean;
  projectId?: string | null;
  disabled?: boolean;
}

const MobileChatInput: React.FC<MobileChatInputProps> = ({
  value,
  onChange,
  onSend,
  onDocumentUpload,
  onScheduleOfWorks,
  placeholder = "Type a message...",
  isLoading = false,
  isUploading = false,
  projectId,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(48);
  const keyboardState = useKeyboard();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 48), 120);
      setTextareaHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSend();
      }
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle send button click
  const handleSendClick = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSend();
    }
  };

  // Auto-focus on mount for mobile apps
  useEffect(() => {
    if (ENVIRONMENT.IS_MOBILE_APP && textareaRef.current) {
      // Small delay to ensure the component is fully mounted
      // setTimeout(() => {
      //   textareaRef.current?.focus();
      // }, 100);
    }
  }, []);

  // Handle focus and blur events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Button action handlers with haptic feedback
  const handleButtonPress = (action: () => void) => {
    // Trigger haptic feedback on mobile
    if (ENVIRONMENT.IS_MOBILE_APP) {
      try {
        import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
          Haptics.impact({ style: ImpactStyle.Light });
        });
      } catch (error) {
        console.warn('Haptics not available');
      }
    }
    action();
  };

  const containerClasses = `
    ${ENVIRONMENT.IS_MOBILE_APP ? 'mobile-app-input' : 'text-input-container'}
    ${isFocused ? 'focused' : ''}
    ${keyboardState.isVisible ? 'keyboard-visible' : ''}
  `;

  const inputClasses = `
    ${ENVIRONMENT.IS_MOBILE_APP ? 'chat-input' : 'chat-input-web'}
    ${isFocused ? 'focused' : ''}
    transition-all duration-300 ease-in-out
  `;

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={inputClasses}>
        {/* Action buttons for project-specific features */}
        <div className="flex items-center gap-2">
          {projectId && onDocumentUpload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleButtonPress(onDocumentUpload)}
              disabled={isUploading || disabled}
              className="native-button haptic-feedback p-2 h-10 w-10 rounded-full hover:bg-white/10 transition-colors"
              title="Upload Document"
            >
              <Upload className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
            </Button>
          )}
          
          {projectId && onScheduleOfWorks && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleButtonPress(onScheduleOfWorks)}
              disabled={disabled}
              className="native-button haptic-feedback p-2 h-10 w-10 rounded-full hover:bg-white/10 transition-colors"
              title="Schedule of Works"
            >
              <Clock className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Text input area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={`
              w-full px-4 py-3 pr-12 rounded-full resize-none
              transition-all duration-200 ease-in-out
              ${ENVIRONMENT.IS_MOBILE_APP ? `
                bg-transparent border-none outline-none text-white placeholder-gray-400
                font-medium text-base leading-relaxed
              ` : `
                bg-gray-900/70 border border-gray-700/50 text-white placeholder-gray-400
                focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                backdrop-blur-sm shadow-lg
              `}
              ${isFocused ? 'placeholder-opacity-50' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            
          />
          
          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleSendClick}
            disabled={!value.trim() || isLoading || disabled}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200 ease-in-out
              ${value.trim() && !isLoading && !disabled 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg' 
                : 'bg-gray-600 opacity-50 cursor-not-allowed'
              }
              ${ENVIRONMENT.IS_MOBILE_APP ? 'native-button haptic-feedback' : ''}
            `}
            title="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </motion.button>
        </div>

        {/* Voice input button (mobile only) */}
        {/* {ENVIRONMENT.IS_MOBILE_APP && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: Implement voice input
              console.log('Voice input not implemented yet');
            }}
            disabled={disabled}
            className="native-button haptic-feedback p-2 h-10 w-10 rounded-full hover:bg-white/10 transition-colors"
            title="Voice Input"
          >
            <Mic className="w-5 h-5" />
          </Button>
        )} */}
      </div>

      {/* Keyboard spacer for mobile apps */}
      {/* {ENVIRONMENT.IS_MOBILE_APP && keyboardState.isVisible && (
        <div 
          className="keyboard-spacer"
          style={{ height: `${keyboardState.height}px` }}
        />
      )} */}
    </motion.div>
  );
};

export default MobileChatInput;
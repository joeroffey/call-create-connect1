import { useCallback, useRef } from 'react';

interface UseMobileInputFocusOptions {
  enabled?: boolean;
  delay?: number;
  block?: ScrollLogicalPosition;
}

export const useMobileInputFocus = (options: UseMobileInputFocusOptions = {}) => {
  const {
    enabled = true,
    delay = 300,
    block = 'center'
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleFocus = useCallback((element: HTMLElement) => {
    if (!enabled) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) return;

    timeoutRef.current = setTimeout(() => {
      try {
        // Check if element is still focused and visible
        if (document.activeElement === element && element.offsetParent !== null) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block,
            inline: 'nearest'
          });
        }
      } catch (error) {
        console.warn('Mobile input focus scroll failed:', error);
      }
    }, delay);
  }, [enabled, delay, block]);

  const getInputProps = useCallback(() => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleFocus(e.target);
    }
  }), [handleFocus]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    getInputProps,
    handleFocus,
    cleanup
  };
};
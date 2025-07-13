import { useEffect, useState } from 'react';

/**
 * Environment Detection Utilities
 * Provides platform-specific environment variables and viewport calculations
 */

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      getPlatform: () => string;
      isNativePlatform: () => boolean;
    };
  }
  interface Navigator {
    standalone?: boolean;
  }
}

// Platform Detection
export const ENVIRONMENT = {
  // Platform detection
  IS_BROWSER: typeof window !== 'undefined' && !(window as any).Capacitor,
  IS_MOBILE_APP: typeof window !== 'undefined' && !!(window as any).Capacitor,
  IS_IOS_APP: typeof window !== 'undefined' && !!(window as any).Capacitor && (window as any).Capacitor.getPlatform() === 'ios',
  IS_ANDROID_APP: typeof window !== 'undefined' && !!(window as any).Capacitor && (window as any).Capacitor.getPlatform() === 'android',
  
  // Browser-specific detection
  IS_MOBILE_BROWSER: typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  IS_DESKTOP_BROWSER: typeof window !== 'undefined' && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  // Specific browser detection
  IS_SAFARI: typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  IS_CHROME: typeof window !== 'undefined' && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
  IS_FIREFOX: typeof window !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
  
  // PWA detection
  IS_PWA: typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone ||
    document.referrer.includes('android-app://')
  ),
  
  // Development environment
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Keyboard Management for Mobile Apps
export class KeyboardManager {
  private static instance: KeyboardManager;
  private listeners: Set<(isVisible: boolean, keyboardHeight: number) => void> = new Set();
  private isKeyboardVisible = false;
  private keyboardHeight = 0;
  private visualViewportSupported = false;

  private constructor() {
    this.init();
  }

  static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Check for visual viewport support
    this.visualViewportSupported = !!window.visualViewport;

    if (ENVIRONMENT.IS_MOBILE_APP) {
      // For native mobile apps, use Capacitor's keyboard events
      if (window.Capacitor) {
        this.setupCapacitorKeyboard();
      }
    } else if (this.visualViewportSupported) {
      // For mobile browsers with visual viewport support
      this.setupVisualViewport();
    } else {
      // Fallback for older browsers
      this.setupFallbackKeyboard();
    }
  }

  private setupCapacitorKeyboard() {
    // Import Capacitor keyboard plugin dynamically
    try {
      // Check if keyboard plugin is available
      if (typeof window !== 'undefined' && window.Capacitor) {
        // Use dynamic import to avoid build errors
        const loadKeyboard = async () => {
          try {
            const { Keyboard } = await import('@capacitor/keyboard');
            Keyboard.addListener('keyboardWillShow', (info: any) => {
              this.isKeyboardVisible = true;
              this.keyboardHeight = info.keyboardHeight;
              this.notifyListeners(true, info.keyboardHeight);
            });

            Keyboard.addListener('keyboardWillHide', () => {
              this.isKeyboardVisible = false;
              this.keyboardHeight = 0;
              this.notifyListeners(false, 0);
            });
          } catch (error) {
            console.warn('Keyboard plugin not available:', error);
          }
        };
        loadKeyboard();
      }
    } catch (error) {
      console.warn('Capacitor keyboard setup failed:', error);
    }
  }

  private setupVisualViewport() {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      const viewport = window.visualViewport!;
      const isKeyboardOpen = viewport.height < window.innerHeight * 0.75;
      const keyboardHeight = window.innerHeight - viewport.height;

      if (isKeyboardOpen !== this.isKeyboardVisible) {
        this.isKeyboardVisible = isKeyboardOpen;
        this.keyboardHeight = isKeyboardOpen ? keyboardHeight : 0;
        this.notifyListeners(isKeyboardOpen, this.keyboardHeight);
      }
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
  }

  private setupFallbackKeyboard() {
    // Fallback for older browsers
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      const isKeyboardOpen = heightDifference > 150; // Threshold for keyboard

      if (isKeyboardOpen !== this.isKeyboardVisible) {
        this.isKeyboardVisible = isKeyboardOpen;
        this.keyboardHeight = isKeyboardOpen ? heightDifference : 0;
        this.notifyListeners(isKeyboardOpen, this.keyboardHeight);
      }
    };

    window.addEventListener('resize', handleResize);
  }

  private notifyListeners(isVisible: boolean, height: number) {
    this.listeners.forEach(listener => listener(isVisible, height));
  }

  onKeyboardToggle(callback: (isVisible: boolean, keyboardHeight: number) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getKeyboardInfo() {
    return {
      isVisible: this.isKeyboardVisible,
      height: this.keyboardHeight
    };
  }
}

// Viewport Calculation Functions
export const getViewportHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    // Mobile apps have stable viewport
    return '100vh';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Mobile browsers need special handling for address bar
    return '100dvh'; // Dynamic viewport height (better than svh)
  } else {
    // Desktop browsers
    return '100vh';
  }
};

export const getViewportHeightWithFallback = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    return '100vh';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Use dynamic viewport height with fallback
    return 'min(100vh, 100dvh)';
  } else {
    return '100vh';
  }
};

export const getMaxViewportHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    return '100vh';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    return '100dvh';
  } else {
    return '100vh';
  }
};

// CSS Custom Properties for Viewport
export const generateViewportCSS = (): string => {
  const height = getViewportHeight();
  const maxHeight = getMaxViewportHeight();
  
  return `
    --viewport-height: ${height};
    --max-viewport-height: ${maxHeight};
    --safe-viewport-height: ${ENVIRONMENT.IS_MOBILE_BROWSER ? 'calc(100dvh - 60px)' : height};
    --keyboard-height: 0px;
    --available-height: ${height};
  `;
};

// Chat Interface Specific Heights
export const getChatInterfaceHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    // Mobile apps: Full height minus navigation and keyboard
    return 'calc(var(--viewport-height) - var(--navigation-height) - var(--keyboard-height))';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Mobile browsers: Account for address bar and navigation
    return 'calc(100dvh - 140px - var(--keyboard-height))';
  } else {
    // Desktop: Full height minus navigation
    return 'calc(100vh - 80px)';
  }
};

export const getTextInputHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    // Mobile apps: Fixed position from bottom
    return 'auto';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Mobile browsers: Account for virtual keyboard
    return 'auto';
  } else {
    // Desktop: Standard height
    return 'auto';
  }
};

// Navigation Bar Heights
export const getNavigationHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP || ENVIRONMENT.IS_MOBILE_BROWSER) {
    return '80px'; // Larger touch targets on mobile
  } else {
    return '60px'; // Smaller on desktop
  }
};

// Initialize CSS Custom Properties
export const initializeViewportCSS = (): void => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        ${generateViewportCSS()}
        --navigation-height: ${getNavigationHeight()};
        --chat-interface-height: ${getChatInterfaceHeight()};
      }
      
      /* Platform-specific viewport classes */
      .viewport-height {
        height: var(--viewport-height);
      }
      
      .max-viewport-height {
        max-height: var(--max-viewport-height);
      }
      
      .safe-viewport-height {
        height: var(--safe-viewport-height);
      }
      
      .chat-interface-height {
        height: var(--chat-interface-height);
      }
      
      /* Mobile app specific styles */
      ${ENVIRONMENT.IS_MOBILE_APP ? `
        .mobile-app-input {
          position: fixed;
          bottom: calc(env(safe-area-inset-bottom) + 8px);
          left: 16px;
          right: 16px;
          z-index: 1000;
          transform: translateY(var(--keyboard-offset, 0px));
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mobile-app-content {
          padding-bottom: calc(80px + env(safe-area-inset-bottom));
        }
        
        .mobile-app-keyboard-visible .mobile-app-content {
          padding-bottom: calc(80px + var(--keyboard-height) + env(safe-area-inset-bottom));
        }
      ` : ''}
      
      /* Text input positioning */
      .text-input-container {
        ${ENVIRONMENT.IS_MOBILE_BROWSER ? `
          position: fixed;
          bottom: calc(env(safe-area-inset-bottom) + var(--keyboard-height));
          left: 0;
          right: 0;
          z-index: 1000;
          transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        ` : ''}
      }
      
      /* Enhanced keyboard handling */
      .keyboard-visible {
        --keyboard-offset: calc(-1 * var(--keyboard-height));
      }
      
      /* Browser-specific fixes */
      ${ENVIRONMENT.IS_MOBILE_BROWSER ? `
        @supports (height: 100dvh) {
          .dynamic-viewport {
            height: 100dvh;
          }
        }
        
        @supports (-webkit-touch-callout: none) {
          .ios-keyboard-fix {
            padding-bottom: calc(env(keyboard-inset-height, 0px) + var(--keyboard-height));
          }
        }
        
        @media screen and (max-height: 600px) {
          .compact-layout {
            --navigation-height: 60px;
            --chat-interface-height: calc(100dvh - 120px - var(--keyboard-height));
          }
        }
      ` : ''}
      
      /* Touch improvements for mobile apps */
      ${ENVIRONMENT.IS_MOBILE_APP ? `
        .touch-optimized {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .touch-optimized input,
        .touch-optimized textarea {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        .native-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        .native-button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border-radius: 12px;
          min-height: 44px;
          min-width: 44px;
        }
      ` : ''}
    `;
    document.head.appendChild(style);
    
    // Initialize keyboard manager for mobile apps
    if (ENVIRONMENT.IS_MOBILE_APP) {
      const keyboardManager = KeyboardManager.getInstance();
      keyboardManager.onKeyboardToggle((isVisible, height) => {
        document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
        document.body.classList.toggle('keyboard-visible', isVisible);
        document.body.classList.toggle('mobile-app-keyboard-visible', isVisible);
      });
    }
  }
};

// Reactive viewport height (for dynamic changes)
export const useViewportHeight = () => {
  if (typeof window === 'undefined') return getViewportHeight();
  
  const [height, setHeight] = useState(getViewportHeight());
  
  useEffect(() => {
    const updateHeight = () => {
      setHeight(getViewportHeight());
    };
    
    // Listen for viewport changes (orientation, keyboard, etc.)
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    
    // For mobile browsers, listen for visual viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
    }
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight);
      }
    };
  }, []);
  
  return height;
};

// Hook for keyboard state
export const useKeyboard = () => {
  const [keyboardState, setKeyboardState] = useState({ isVisible: false, height: 0 });
  
  useEffect(() => {
    if (ENVIRONMENT.IS_MOBILE_APP) {
      const keyboardManager = KeyboardManager.getInstance();
      return keyboardManager.onKeyboardToggle((isVisible, height) => {
        setKeyboardState({ isVisible, height });
      });
    }
  }, []);
  
  return keyboardState;
};

// Export environment constants for use in components
export default ENVIRONMENT;
/**
 * Environment Detection Utilities
 * Provides platform-specific environment variables and viewport calculations
 */

// Platform Detection
export const ENVIRONMENT = {
  // Platform detection
  IS_BROWSER: typeof window !== 'undefined' && !window.Capacitor,
  IS_MOBILE_APP: typeof window !== 'undefined' && !!window.Capacitor,
  IS_IOS_APP: typeof window !== 'undefined' && !!window.Capacitor && window.Capacitor.getPlatform() === 'ios',
  IS_ANDROID_APP: typeof window !== 'undefined' && !!window.Capacitor && window.Capacitor.getPlatform() === 'android',
  
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
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  ),
  
  // Development environment
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Viewport Calculation Functions
export const getViewportHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    // Mobile apps have stable viewport
    return '100vh';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Mobile browsers need special handling for address bar
    return '100svh'; // Small viewport height (excludes address bar)
  } else {
    // Desktop browsers
    return '100vh';
  }
};

export const getViewportHeightWithFallback = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    return '100vh';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Use small viewport height with fallback to fill-available
    return 'min(100vh, -webkit-fill-available)';
  } else {
    return '100vh';
  }
};

export const getMaxViewportHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    return '100vh';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    return '100svh';
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
    --safe-viewport-height: ${ENVIRONMENT.IS_MOBILE_BROWSER ? 'calc(100vh - 60px)' : height};
  `;
};

// Chat Interface Specific Heights
export const getChatInterfaceHeight = (): string => {
  if (ENVIRONMENT.IS_MOBILE_APP) {
    // Mobile apps: Full height minus navigation (around 80px)
    return 'calc(100vh - 80px)';
  } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
    // Mobile browsers: Account for address bar and navigation
    return 'calc(100svh - 140px)';
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
      
      /* Text input positioning */
      .text-input-container {
        ${ENVIRONMENT.IS_MOBILE_BROWSER ? `
          position: fixed;
          bottom: env(safe-area-inset-bottom, 0px);
          left: 0;
          right: 0;
          z-index: 1000;
        ` : ''}
      }
      
      /* Browser-specific fixes */
      ${ENVIRONMENT.IS_MOBILE_BROWSER ? `
        @supports (-webkit-touch-callout: none) {
          .ios-keyboard-fix {
            padding-bottom: env(keyboard-inset-height, 0px);
          }
        }
        
        @media screen and (max-height: 600px) {
          .compact-layout {
            --navigation-height: 60px;
            --chat-interface-height: calc(100svh - 120px);
          }
        }
      ` : ''}
    `;
    document.head.appendChild(style);
  }
};

// Reactive viewport height (for dynamic changes)
export const useViewportHeight = () => {
  if (typeof window === 'undefined') return getViewportHeight();
  
  const [height, setHeight] = React.useState(getViewportHeight());
  
  React.useEffect(() => {
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

// Export environment constants for use in components
export default ENVIRONMENT;
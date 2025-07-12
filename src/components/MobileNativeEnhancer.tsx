import React, { useEffect, useState } from 'react';
import { useNativeCapabilities } from '@/hooks/useNativeCapabilities';
import { Style as StatusBarStyle } from '@capacitor/status-bar';

interface MobileNativeEnhancerProps {
  children: React.ReactNode;
  statusBarStyle?: StatusBarStyle;
  enableHaptics?: boolean;
  enableKeyboardOptimization?: boolean;
}

/**
 * MobileNativeEnhancer - Wraps components with native mobile enhancements
 * 
 * Features:
 * - Automatic status bar styling
 * - Native haptic feedback on interactions
 * - Keyboard optimization for mobile forms
 * - Screen reader support
 * - Native sharing capabilities
 * - Enhanced touch interactions
 */
export const MobileNativeEnhancer: React.FC<MobileNativeEnhancerProps> = ({
  children,
  statusBarStyle = StatusBarStyle.Dark,
  enableHaptics = true,
  enableKeyboardOptimization = true
}) => {
  const native = useNativeCapabilities();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Initialize native features on mount
  useEffect(() => {
    if (!native.isNative) return;

    const initializeNative = async () => {
      try {
        // Initialize native capabilities
        await native.initialize();
        
        // Set status bar style
        await native.statusBar.setStyle(statusBarStyle);
        await native.statusBar.setBackgroundColor('#000000');
        
        // Hide splash screen after short delay
        setTimeout(() => {
          native.splashScreen.hide();
        }, 1000);
        
        console.log('Mobile native features initialized');
      } catch (error) {
        console.warn('Failed to initialize native features:', error);
      }
    };

    initializeNative();
  }, [native, statusBarStyle]);

  // Keyboard optimization
  useEffect(() => {
    if (!native.isNative || !enableKeyboardOptimization) return;

    const keyboardCleanup = native.keyboard.addListener((info) => {
      if (info.keyboardHeight) {
        setKeyboardHeight(info.keyboardHeight);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    });

    return keyboardCleanup;
  }, [native, enableKeyboardOptimization]);

  // Enhanced click handler with haptic feedback
  const handleNativeClick = (originalHandler?: () => void) => {
    return async () => {
      if (enableHaptics && native.isNative) {
        await native.hapticFeedback.light();
      }
      originalHandler?.();
    };
  };

  // Add touch optimization styles for mobile
  const mobileStyles: React.CSSProperties = native.isNative ? {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    ...(isKeyboardVisible && {
      paddingBottom: `${keyboardHeight}px`,
      transition: 'padding-bottom 0.3s ease-in-out'
    })
  } : {};

  // Enhanced children with native capabilities
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    // Add native props to interactive elements
    const enhancedProps: any = {};

    // Add haptic feedback to clickable elements
    if (child.props.onClick && enableHaptics && native.isNative) {
      enhancedProps.onClick = handleNativeClick(child.props.onClick);
    }

    // Add touch optimization classes
    if (native.isNative) {
      enhancedProps.className = `${child.props.className || ''} touch-optimized`.trim();
    }

    return React.cloneElement(child, enhancedProps);
  });

  return (
    <div 
      className={`mobile-native-container ${native.isNative ? 'native-app' : 'web-app'}`}
      style={mobileStyles}
    >
      {enhancedChildren}
      
      {/* Native-specific overlay for keyboard handling */}
      {native.isNative && isKeyboardVisible && (
        <div 
          className="keyboard-overlay"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${keyboardHeight}px`,
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}
    </div>
  );
};

/**
 * Hook for accessing native mobile features in components
 */
export const useNativeMobileFeatures = () => {
  const native = useNativeCapabilities();
  
  return {
    // Platform detection
    isNative: native.isNative,
    isIOS: native.isIOS,
    isAndroid: native.isAndroid,
    
    // Quick access methods
    showToast: native.notifications.showToast,
    hapticSuccess: native.hapticFeedback.success,
    hapticError: native.hapticFeedback.error,
    hapticLight: native.hapticFeedback.light,
    shareContent: native.sharing.shareContent,
    takePhoto: native.camera.takePhoto,
    selectPhoto: native.camera.selectFromGallery,
    saveFile: native.filesystem.saveFile,
    speak: native.accessibility.speak,
    
    // Storage shortcuts
    savePreference: native.storage.setPreference,
    getPreference: native.storage.getPreference,
    
    // Device info
    deviceInfo: native.deviceInfo,
    isOnline: native.isOnline,
    
    // Full native capabilities
    native
  };
};

export default MobileNativeEnhancer;
import { useEffect, useState } from 'react';

/**
 * React hook for accessing native iOS capabilities
 * Provides a clean interface for using native features in React components
 */
export const useNativeCapabilities = () => {
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Initialize native capabilities
    const initNative = async () => {
      try {
        // Check if running as native app
        const isNative = !!(window as any).Capacitor;
        setIsNativeApp(isNative);

        if (isNative) {
          // Dynamically import native capabilities to avoid errors in web environment
          const { nativeCapabilities } = await import('../services/nativeCapabilities');
          
          // Get device info
          const deviceInfo = nativeCapabilities.getDeviceInfo();
          setDeviceInfo(deviceInfo);
          setIsIOS(deviceInfo?.platform === 'ios');

          // Check network status
          const networkStatus = await nativeCapabilities.getNetworkStatus();
          setIsOnline(networkStatus.connected);

          console.log('Native capabilities initialized in hook');
        }
      } catch (error) {
        console.error('Error initializing native capabilities:', error);
      }
    };

    initNative();
  }, []);

  /**
   * Provide haptic feedback
   */
  const hapticFeedback = async (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error') => {
    if (!isNativeApp || !isIOS) return;
    
    try {
      const { nativeCapabilities } = await import('../services/nativeCapabilities');
      await nativeCapabilities.hapticFeedback(type);
    } catch (error) {
      console.error('Error providing haptic feedback:', error);
    }
  };

  /**
   * Set status bar color
   */
  const setStatusBarColor = async (color: string, isDark: boolean = false) => {
    if (!isNativeApp || !isIOS) return;
    
    try {
      const { nativeCapabilities } = await import('../services/nativeCapabilities');
      await nativeCapabilities.setStatusBarColor(color, isDark);
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  };

  /**
   * Handle button press with native feedback
   */
  const handleNativeButtonPress = async (callback: () => void, feedbackType: 'light' | 'medium' | 'heavy' = 'light') => {
    await hapticFeedback(feedbackType);
    callback();
  };

  /**
   * Handle successful action with native feedback
   */
  const handleNativeSuccess = async (callback?: () => void) => {
    await hapticFeedback('success');
    if (callback) callback();
  };

  /**
   * Handle error with native feedback
   */
  const handleNativeError = async (callback?: () => void) => {
    await hapticFeedback('error');
    if (callback) callback();
  };

  /**
   * Get app info for display
   */
  const getAppInfo = () => {
    return {
      isNativeApp,
      isIOS,
      isOnline,
      deviceInfo,
      platform: deviceInfo?.platform || 'web',
      model: deviceInfo?.model || 'Unknown',
      operatingSystem: deviceInfo?.operatingSystem || 'Web',
      osVersion: deviceInfo?.osVersion || 'Unknown'
    };
  };

  return {
    // State
    isNativeApp,
    isIOS,
    isOnline,
    deviceInfo,
    
    // Actions
    hapticFeedback,
    setStatusBarColor,
    handleNativeButtonPress,
    handleNativeSuccess,
    handleNativeError,
    getAppInfo
  };
};
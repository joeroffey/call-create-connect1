import { useEffect, useState, useCallback } from 'react';
import { nativeCapabilities } from '@/services/nativeCapabilities';
import { ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Style as StatusBarStyle } from '@capacitor/status-bar';

/**
 * React hook for accessing native iOS capabilities
 * Provides a clean interface for using native features in React components
 */
export interface UseNativeCapabilitiesReturn {
  // Platform detection
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  
  // Device info
  deviceInfo: any | null;
  deviceId: string | null;
  batteryInfo: any | null;
  
  // Network status
  networkStatus: any | null;
  isOnline: boolean;
  
  // Methods
  hapticFeedback: {
    light: () => Promise<void>;
    medium: () => Promise<void>;
    heavy: () => Promise<void>;
    selection: () => Promise<void>;
    success: () => Promise<void>;
    error: () => Promise<void>;
    warning: () => Promise<void>;
  };
  statusBar: {
    setStyle: (style: StatusBarStyle) => Promise<void>;
    setBackgroundColor: (color: string) => Promise<void>;
    hide: () => Promise<void>;
    show: () => Promise<void>;
  };
  splashScreen: {
    hide: () => Promise<void>;
    show: () => Promise<void>;
  };
  
  // Lifecycle
  refreshDeviceInfo: () => Promise<void>;
  refreshNetworkStatus: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useNativeCapabilities = (): UseNativeCapabilitiesReturn => {
  const [deviceInfo, setDeviceInfo] = useState<any | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<any | null>(null);
  const [networkStatus, setNetworkStatus] = useState<any | null>(null);
  
  // Platform detection from service
  const { isNative, isIOS, isAndroid, isWeb } = nativeCapabilities;
  
  // Calculate online status
  const isOnline = networkStatus?.connected ?? true;

  // Initialize device info on mount
  const refreshDeviceInfo = useCallback(async () => {
    try {
      const [info, id, battery] = await Promise.all([
        nativeCapabilities.getDeviceInfo(),
        nativeCapabilities.getDeviceId(),
        nativeCapabilities.getBatteryInfo()
      ]);
      
      setDeviceInfo(info);
      setDeviceId(id);
      setBatteryInfo(battery);
    } catch (error) {
      console.warn('Failed to refresh device info:', error);
    }
  }, []);

  // Refresh network status
  const refreshNetworkStatus = useCallback(async () => {
    try {
      const status = await nativeCapabilities.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.warn('Failed to refresh network status:', error);
    }
  }, []);

  // Initialize native features
  const initialize = useCallback(async () => {
    try {
      await nativeCapabilities.initializeNativeFeatures();
      await Promise.all([refreshDeviceInfo(), refreshNetworkStatus()]);
    } catch (error) {
      console.warn('Failed to initialize native capabilities:', error);
    }
  }, [refreshDeviceInfo, refreshNetworkStatus]);

  // Haptic feedback methods
  const hapticFeedback = {
    light: useCallback(() => nativeCapabilities.hapticImpact(ImpactStyle.Light), []),
    medium: useCallback(() => nativeCapabilities.hapticImpact(ImpactStyle.Medium), []),
    heavy: useCallback(() => nativeCapabilities.hapticImpact(ImpactStyle.Heavy), []),
    selection: useCallback(() => nativeCapabilities.hapticSelection(), []),
    success: useCallback(() => nativeCapabilities.hapticNotification(NotificationType.Success), []),
    error: useCallback(() => nativeCapabilities.hapticNotification(NotificationType.Error), []),
    warning: useCallback(() => nativeCapabilities.hapticNotification(NotificationType.Warning), []),
  };

  // Status bar methods
  const statusBar = {
    setStyle: useCallback((style: StatusBarStyle) => nativeCapabilities.setStatusBarStyle(style), []),
    setBackgroundColor: useCallback((color: string) => nativeCapabilities.setStatusBarBackgroundColor(color), []),
    hide: useCallback(() => nativeCapabilities.hideStatusBar(), []),
    show: useCallback(() => nativeCapabilities.showStatusBar(), []),
  };

  // Splash screen methods
  const splashScreen = {
    hide: useCallback(() => nativeCapabilities.hideSplashScreen(), []),
    show: useCallback(() => nativeCapabilities.showSplashScreen(), []),
  };

  // Set up listeners on mount
  useEffect(() => {
    const cleanup: (() => void)[] = [];

    // Initialize on mount
    initialize();

    // Set up network status listener
    if (isNative) {
      const networkCleanup = nativeCapabilities.addNetworkListener((status) => {
        setNetworkStatus(status);
      });
      cleanup.push(networkCleanup);

      // Set up app state listener
      const appStateCleanup = nativeCapabilities.addAppStateListener((state) => {
        if (state.isActive) {
          // Refresh data when app becomes active
          refreshDeviceInfo();
          refreshNetworkStatus();
        }
      });
      cleanup.push(appStateCleanup);
    }

    // Cleanup listeners on unmount
    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [initialize, refreshDeviceInfo, refreshNetworkStatus, isNative]);

  return {
    // Platform detection
    isNative,
    isIOS,
    isAndroid,
    isWeb,
    
    // Device info
    deviceInfo,
    deviceId,
    batteryInfo,
    
    // Network status
    networkStatus,
    isOnline,
    
    // Methods
    hapticFeedback,
    statusBar,
    splashScreen,
    
    // Lifecycle
    refreshDeviceInfo,
    refreshNetworkStatus,
    initialize,
  };
};

export default useNativeCapabilities;
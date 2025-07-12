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
  camera: {
    takePhoto: () => Promise<string>;
    selectFromGallery: () => Promise<string>;
  };
  filesystem: {
    saveFile: (filename: string, data: string) => Promise<string>;
    readFile: (path: string) => Promise<string>;
    deleteFile: (path: string) => Promise<void>;
  };
  sharing: {
    shareContent: (title: string, text: string, url?: string) => Promise<void>;
  };
  notifications: {
    showToast: (message: string, duration?: 'short' | 'long') => Promise<void>;
    scheduleNotification: (title: string, body: string, date: Date) => Promise<void>;
  };
  keyboard: {
    show: () => Promise<void>;
    hide: () => Promise<void>;
    addListener: (callback: (info: any) => void) => () => void;
  };
  accessibility: {
    speak: (text: string) => Promise<void>;
  };
  storage: {
    setPreference: (key: string, value: string) => Promise<void>;
    getPreference: (key: string) => Promise<string | null>;
    removePreference: (key: string) => Promise<void>;
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

  // New capability methods
  const camera = {
    takePhoto: useCallback(() => nativeCapabilities.takePhoto(), []),
    selectFromGallery: useCallback(() => nativeCapabilities.selectFromGallery(), []),
  };

  const filesystem = {
    saveFile: useCallback((filename: string, data: string) => nativeCapabilities.saveFile(filename, data), []),
    readFile: useCallback((path: string) => nativeCapabilities.readFile(path), []),
    deleteFile: useCallback((path: string) => nativeCapabilities.deleteFile(path), []),
  };

  const sharing = {
    shareContent: useCallback((title: string, text: string, url?: string) => nativeCapabilities.shareContent(title, text, url), []),
  };

  const notifications = {
    showToast: useCallback((message: string, duration?: 'short' | 'long') => nativeCapabilities.showToast(message, duration), []),
    scheduleNotification: useCallback((title: string, body: string, date: Date) => nativeCapabilities.scheduleNotification(title, body, date), []),
  };

  const keyboard = {
    show: useCallback(() => nativeCapabilities.showKeyboard(), []),
    hide: useCallback(() => nativeCapabilities.hideKeyboard(), []),
    addListener: useCallback((callback: (info: any) => void) => nativeCapabilities.addKeyboardListener(callback), []),
  };

  const accessibility = {
    speak: useCallback((text: string) => nativeCapabilities.speak(text), []),
  };

  const storage = {
    setPreference: useCallback((key: string, value: string) => nativeCapabilities.setPreference(key, value), []),
    getPreference: useCallback((key: string) => nativeCapabilities.getPreference(key), []),
    removePreference: useCallback((key: string) => nativeCapabilities.removePreference(key), []),
  };

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
    camera,
    filesystem,
    sharing,
    notifications,
    keyboard,
    accessibility,
    storage,
    
    // Lifecycle
    refreshDeviceInfo,
    refreshNetworkStatus,
    initialize,
  };
};

export default useNativeCapabilities;
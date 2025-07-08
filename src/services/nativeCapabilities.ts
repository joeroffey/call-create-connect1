
import { 
  StatusBar, 
  Style as StatusBarStyle 
} from '@capacitor/status-bar';
import { 
  SplashScreen 
} from '@capacitor/splash-screen';
import { 
  App, 
  URLOpenListenerEvent 
} from '@capacitor/app';
import { 
  Device, 
  DeviceInfo 
} from '@capacitor/device';
import { 
  Haptics, 
  ImpactStyle,
  NotificationType 
} from '@capacitor/haptics';
import { 
  Network, 
  ConnectionStatus 
} from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export interface NativeCapabilities {
  // Haptic feedback
  hapticImpact: (style?: ImpactStyle) => Promise<void>;
  hapticNotification: (type?: NotificationType) => Promise<void>;
  hapticSelection: () => Promise<void>;
  
  // Status bar control
  setStatusBarStyle: (style: StatusBarStyle) => Promise<void>;
  setStatusBarBackgroundColor: (color: string) => Promise<void>;
  hideStatusBar: () => Promise<void>;
  showStatusBar: () => Promise<void>;
  
  // App lifecycle
  addAppStateListener: (callback: (state: any) => void) => () => void;
  addUrlOpenListener: (callback: (url: string) => void) => () => void;
  exitApp: () => Promise<void>;
  
  // Device info
  getDeviceInfo: () => Promise<any>;
  getDeviceId: () => Promise<string>;
  getBatteryInfo: () => Promise<any>;
  
  // Network monitoring
  getNetworkStatus: () => Promise<any>;
  addNetworkListener: (callback: (status: any) => void) => () => void;
  
  // Splash screen
  hideSplashScreen: () => Promise<void>;
  showSplashScreen: () => Promise<void>;
  
  // Platform detection
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
}

class NativeCapabilitiesService implements NativeCapabilities {
  public readonly isNative: boolean;
  public readonly isIOS: boolean;
  public readonly isAndroid: boolean;
  public readonly isWeb: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isIOS = Capacitor.getPlatform() === 'ios';
    this.isAndroid = Capacitor.getPlatform() === 'android';
    this.isWeb = Capacitor.getPlatform() === 'web';
  }

  // Haptic Feedback Methods
  async hapticImpact(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptic impact failed:', error);
    }
  }

  async hapticNotification(type: NotificationType = NotificationType.Success): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.warn('Haptic notification failed:', error);
    }
  }

  async hapticSelection(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptic selection failed:', error);
    }
  }

  // Status Bar Methods
  async setStatusBarStyle(style: StatusBarStyle): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await StatusBar.setStyle({ style });
    } catch (error) {
      console.warn('Set status bar style failed:', error);
    }
  }

  async setStatusBarBackgroundColor(color: string): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.warn('Set status bar background color failed:', error);
    }
  }

  async hideStatusBar(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await StatusBar.hide();
    } catch (error) {
      console.warn('Hide status bar failed:', error);
    }
  }

  async showStatusBar(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await StatusBar.show();
    } catch (error) {
      console.warn('Show status bar failed:', error);
    }
  }

  // App Lifecycle Methods
  addAppStateListener(callback: (state: any) => void): () => void {
    if (!this.isNative) return () => {};
    
    try {
      let listenerHandle: any = null;
      
      App.addListener('appStateChange', callback).then(handle => {
        listenerHandle = handle;
      });
      
      return () => {
        if (listenerHandle) {
          listenerHandle.remove();
        }
      };
    } catch (error) {
      console.warn('Add app state listener failed:', error);
      return () => {};
    }
  }

  addUrlOpenListener(callback: (url: string) => void): () => void {
    if (!this.isNative) return () => {};
    
    try {
      let listenerHandle: any = null;
      
      App.addListener('appUrlOpen', (data: any) => {
        callback(data.url);
      }).then(handle => {
        listenerHandle = handle;
      });
      
      return () => {
        if (listenerHandle) {
          listenerHandle.remove();
        }
      };
    } catch (error) {
      console.warn('Add URL open listener failed:', error);
      return () => {};
    }
  }

  async exitApp(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await App.exitApp();
    } catch (error) {
      console.warn('Exit app failed:', error);
    }
  }

  // Device Info Methods
  async getDeviceInfo(): Promise<any> {
    if (!this.isNative) {
      return {
        model: 'Web Browser',
        platform: 'web',
        operatingSystem: 'unknown',
        osVersion: 'unknown',
        manufacturer: 'unknown',
        isVirtual: false,
        webViewVersion: 'unknown'
      };
    }
    
    try {
      return await Device.getInfo();
    } catch (error) {
      console.warn('Get device info failed:', error);
      return null;
    }
  }

  async getDeviceId(): Promise<string> {
    if (!this.isNative) {
      return 'web-' + Date.now().toString();
    }
    
    try {
      const result = await Device.getId();
      return result.identifier || 'unknown';
    } catch (error) {
      console.warn('Get device ID failed:', error);
      return 'unknown';
    }
  }

  async getBatteryInfo(): Promise<any> {
    if (!this.isNative) {
      return { batteryLevel: -1, isCharging: false };
    }
    
    try {
      return await Device.getBatteryInfo();
    } catch (error) {
      console.warn('Get battery info failed:', error);
      return { batteryLevel: -1, isCharging: false };
    }
  }

  // Network Methods
  async getNetworkStatus(): Promise<any> {
    if (!this.isNative) {
      return {
        connected: navigator.onLine,
        connectionType: 'wifi',
      };
    }
    
    try {
      return await Network.getStatus();
    } catch (error) {
      console.warn('Get network status failed:', error);
      return { connected: false, connectionType: 'none' };
    }
  }

  addNetworkListener(callback: (status: any) => void): () => void {
    if (!this.isNative) {
      const handleOnline = () => callback({ connected: true, connectionType: 'wifi' });
      const handleOffline = () => callback({ connected: false, connectionType: 'none' });
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    
    try {
      let listenerHandle: any = null;
      
      Network.addListener('networkStatusChange', callback).then(handle => {
        listenerHandle = handle;
      });
      
      return () => {
        if (listenerHandle) {
          listenerHandle.remove();
        }
      };
    } catch (error) {
      console.warn('Add network listener failed:', error);
      return () => {};
    }
  }

  // Splash Screen Methods
  async hideSplashScreen(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.warn('Hide splash screen failed:', error);
    }
  }

  async showSplashScreen(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await SplashScreen.show({
        showDuration: 2000,
        fadeInDuration: 300,
        fadeOutDuration: 300,
        autoHide: true,
      });
    } catch (error) {
      console.warn('Show splash screen failed:', error);
    }
  }

  // Utility Methods
  async initializeNativeFeatures(): Promise<void> {
    if (!this.isNative) return;

    try {
      // Set appropriate status bar style
      if (this.isIOS) {
        await this.setStatusBarStyle(StatusBarStyle.Dark);
        await this.setStatusBarBackgroundColor('#000000');
      } else if (this.isAndroid) {
        await this.setStatusBarStyle(StatusBarStyle.Dark);
        await this.setStatusBarBackgroundColor('#000000');
      }

      // Hide splash screen after initialization
      setTimeout(async () => {
        await this.hideSplashScreen();
      }, 1000);

    } catch (error) {
      console.warn('Initialize native features failed:', error);
    }
  }

  // Convenience methods for common interactions
  async successFeedback(): Promise<void> {
    await this.hapticNotification(NotificationType.Success);
  }

  async errorFeedback(): Promise<void> {
    await this.hapticNotification(NotificationType.Error);
  }

  async warningFeedback(): Promise<void> {
    await this.hapticNotification(NotificationType.Warning);
  }

  async lightImpact(): Promise<void> {
    await this.hapticImpact(ImpactStyle.Light);
  }

  async mediumImpact(): Promise<void> {
    await this.hapticImpact(ImpactStyle.Medium);
  }

  async heavyImpact(): Promise<void> {
    await this.hapticImpact(ImpactStyle.Heavy);
  }
}

// Export singleton instance
export const nativeCapabilities = new NativeCapabilitiesService();

// Export for easy importing
export default nativeCapabilities;

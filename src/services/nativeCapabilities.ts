
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Keyboard } from '@capacitor/keyboard';
import { ScreenReader } from '@capacitor/screen-reader';
import { Preferences } from '@capacitor/preferences';

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
  
  // Camera and media
  takePhoto: () => Promise<string>;
  selectFromGallery: () => Promise<string>;
  
  // File system
  saveFile: (filename: string, data: string) => Promise<string>;
  readFile: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  
  // Sharing
  shareContent: (title: string, text: string, url?: string) => Promise<void>;
  
  // Notifications
  showToast: (message: string, duration?: 'short' | 'long') => Promise<void>;
  scheduleNotification: (title: string, body: string, date: Date) => Promise<void>;
  
  // Keyboard
  showKeyboard: () => Promise<void>;
  hideKeyboard: () => Promise<void>;
  addKeyboardListener: (callback: (info: any) => void) => () => void;
  
  // Accessibility
  speak: (text: string) => Promise<void>;
  
  // Storage
  setPreference: (key: string, value: string) => Promise<void>;
  getPreference: (key: string) => Promise<string | null>;
  removePreference: (key: string) => Promise<void>;
  
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

  // Camera and Media Methods
  async takePhoto(): Promise<string> {
    if (!this.isNative) throw new Error('Camera not available on web');
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      return image.dataUrl || '';
    } catch (error) {
      console.warn('Take photo failed:', error);
      throw error;
    }
  }

  async selectFromGallery(): Promise<string> {
    if (!this.isNative) throw new Error('Gallery not available on web');
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      
      return image.dataUrl || '';
    } catch (error) {
      console.warn('Select from gallery failed:', error);
      throw error;
    }
  }

  // File System Methods
  async saveFile(filename: string, data: string): Promise<string> {
    if (!this.isNative) {
      // Web fallback - use blob download
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return filename;
    }
    
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: Directory.Documents
      });
      
      return result.uri;
    } catch (error) {
      console.warn('Save file failed:', error);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.isNative) throw new Error('File reading not available on web');
    
    try {
      const result = await Filesystem.readFile({
        path: path,
        directory: Directory.Documents
      });
      
      return result.data as string;
    } catch (error) {
      console.warn('Read file failed:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await Filesystem.deleteFile({
        path: path,
        directory: Directory.Documents
      });
    } catch (error) {
      console.warn('Delete file failed:', error);
      throw error;
    }
  }

  // Sharing Methods
  async shareContent(title: string, text: string, url?: string): Promise<void> {
    if (!this.isNative) {
      // Web fallback - use Web Share API if available
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${title}\n${text}${url ? '\n' + url : ''}`);
      }
      return;
    }
    
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share via'
      });
    } catch (error) {
      console.warn('Share failed:', error);
      throw error;
    }
  }

  // Notification Methods
  async showToast(message: string, duration: 'short' | 'long' = 'short'): Promise<void> {
    if (!this.isNative) {
      console.log('Toast:', message);
      return;
    }
    
    try {
      await Toast.show({
        text: message,
        duration: duration,
        position: 'bottom'
      });
    } catch (error) {
      console.warn('Toast failed:', error);
    }
  }

  async scheduleNotification(title: string, body: string, date: Date): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: date },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.warn('Schedule notification failed:', error);
      throw error;
    }
  }

  // Keyboard Methods
  async showKeyboard(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await Keyboard.show();
    } catch (error) {
      console.warn('Show keyboard failed:', error);
    }
  }

  async hideKeyboard(): Promise<void> {
    if (!this.isNative) return;
    
    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Hide keyboard failed:', error);
    }
  }

  addKeyboardListener(callback: (info: any) => void): () => void {
    if (!this.isNative) return () => {};
    
    const listeners: any[] = [];
    
    const showListener = Keyboard.addListener('keyboardWillShow', callback);
    const hideListener = Keyboard.addListener('keyboardWillHide', callback);
    
    listeners.push(showListener, hideListener);
    
    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }

  // Accessibility Methods
  async speak(text: string): Promise<void> {
    if (!this.isNative) {
      // Web fallback - use Speech Synthesis API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
      }
      return;
    }
    
    try {
      await ScreenReader.speak({ value: text });
    } catch (error) {
      console.warn('Screen reader speak failed:', error);
    }
  }

  // Storage Methods
  async setPreference(key: string, value: string): Promise<void> {
    if (!this.isNative) {
      localStorage.setItem(key, value);
      return;
    }
    
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.warn('Set preference failed:', error);
      throw error;
    }
  }

  async getPreference(key: string): Promise<string | null> {
    if (!this.isNative) {
      return localStorage.getItem(key);
    }
    
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.warn('Get preference failed:', error);
      return null;
    }
  }

  async removePreference(key: string): Promise<void> {
    if (!this.isNative) {
      localStorage.removeItem(key);
      return;
    }
    
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.warn('Remove preference failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const nativeCapabilities = new NativeCapabilitiesService();

// Export for easy importing
export default nativeCapabilities;

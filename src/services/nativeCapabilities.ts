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

/**
 * Native iOS Capabilities Service
 * Provides native iOS functionality for enhanced user experience
 */
export class NativeCapabilities {
  private static instance: NativeCapabilities;
  private deviceInfo: DeviceInfo | null = null;

  private constructor() {
    this.initializeApp();
  }

  public static getInstance(): NativeCapabilities {
    if (!NativeCapabilities.instance) {
      NativeCapabilities.instance = new NativeCapabilities();
    }
    return NativeCapabilities.instance;
  }

  /**
   * Initialize native app features
   */
  private async initializeApp(): Promise<void> {
    try {
      // Get device information
      this.deviceInfo = await Device.getInfo();
      
      // Configure status bar for iOS
      if (this.deviceInfo.platform === 'ios') {
        await this.configureStatusBar();
      }

      // Hide splash screen after app is loaded
      await this.hideSplashScreen();

      // Set up deep link handling
      this.setupDeepLinkHandling();

      // Monitor network status
      this.setupNetworkMonitoring();

      console.log('Native iOS capabilities initialized successfully');
    } catch (error) {
      console.error('Error initializing native capabilities:', error);
    }
  }

  /**
   * Configure iOS status bar for native feel
   */
  private async configureStatusBar(): Promise<void> {
    try {
      await StatusBar.setStyle({ style: StatusBarStyle.Default });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.show();
    } catch (error) {
      console.error('Error configuring status bar:', error);
    }
  }

  /**
   * Hide splash screen with smooth transition
   */
  private async hideSplashScreen(): Promise<void> {
    try {
      // Add a small delay for better UX
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 2000);
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }

  /**
   * Set up deep link handling for iOS
   */
  private setupDeepLinkHandling(): void {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      console.log('App opened with URL:', event.url);
      // Handle deep links here
      this.handleDeepLink(event.url);
    });

    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
      if (isActive) {
        this.onAppBecomeActive();
      }
    });
  }

  /**
   * Handle incoming deep links
   */
  private handleDeepLink(url: string): void {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Navigate to appropriate route based on deep link
      // This would integrate with your React Router
      console.log('Handling deep link path:', path);
      
      // Example: callcreateconnect://profile/123
      if (path.startsWith('/profile/')) {
        const profileId = path.split('/')[2];
        // Navigate to profile page
        window.location.href = `/profile/${profileId}`;
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  /**
   * Set up network monitoring for better UX
   */
  private setupNetworkMonitoring(): void {
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      console.log('Network status changed:', status);
      this.handleNetworkChange(status);
    });
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange(status: ConnectionStatus): void {
    if (!status.connected) {
      // Show offline notification
      this.showOfflineNotification();
    } else {
      // Hide offline notification and sync data
      this.handleOnlineStatus();
    }
  }

  /**
   * Show offline notification to user
   */
  private showOfflineNotification(): void {
    // This would integrate with your notification system
    console.log('App is offline - showing notification');
    // You could trigger a toast or banner here
  }

  /**
   * Handle when app comes back online
   */
  private handleOnlineStatus(): void {
    console.log('App is back online - syncing data');
    // Trigger data sync or refresh
  }

  /**
   * Called when app becomes active
   */
  private onAppBecomeActive(): void {
    // Refresh data, check for updates, etc.
    console.log('App became active - refreshing content');
  }

  /**
   * Provide haptic feedback for better UX
   */
  public async hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'): Promise<void> {
    try {
      if (this.deviceInfo?.platform !== 'ios') return;

      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'selection':
          await Haptics.selectionChanged();
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch (error) {
      console.error('Error providing haptic feedback:', error);
    }
  }

  /**
   * Get device information
   */
  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Check if app is running on iOS
   */
  public isIOS(): boolean {
    return this.deviceInfo?.platform === 'ios';
  }

  /**
   * Get network status
   */
  public async getNetworkStatus(): Promise<ConnectionStatus> {
    return await Network.getStatus();
  }

  /**
   * Set status bar color dynamically
   */
  public async setStatusBarColor(color: string, isDark: boolean = false): Promise<void> {
    try {
      if (!this.isIOS()) return;
      
      await StatusBar.setBackgroundColor({ color });
      await StatusBar.setStyle({ 
        style: isDark ? StatusBarStyle.Dark : StatusBarStyle.Default 
      });
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  }

  /**
   * Update app badge (iOS only)
   */
  public async setAppBadge(count: number): Promise<void> {
    try {
      if (!this.isIOS()) return;
      // This would require additional plugin for badge management
      console.log('Setting app badge count:', count);
    } catch (error) {
      console.error('Error setting app badge:', error);
    }
  }
}

// Export singleton instance
export const nativeCapabilities = NativeCapabilities.getInstance();
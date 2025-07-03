import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.callcreateconnect.app',
  appName: 'Call Create Connect',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#ffffff',
      style: 'Default',
      androidStyle: 'DEFAULT'
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'callcreateconnect'
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true
    },
    Permissions: {
      camera: 'This app needs camera access to take photos',
      microphone: 'This app needs microphone access for audio features',
      notifications: 'This app sends notifications for important updates'
    },
    Device: {
      androidHideNavigationBar: false
    },
    Network: {
      enabled: true
    },
    Haptics: {
      enabled: true
    }
  },
  ios: {
    backgroundColor: '#ffffff',
    allowsLinkPreview: false,
    handleApplicationNotifications: true,
    hideLogs: true,
    disallowOverscroll: true,
    enableViewportScale: false,
    allowsInlineMediaPlayback: true,
    suppresessIncrementalRendering: false,
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    minimumFontSize: 12.0
  },
  server: {
  }
};

export default config;

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eezybuild.app',
  appName: 'EezyBuild',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#000000',
      style: 'Dark',
      androidStyle: 'DARK'
    },
    Keyboard: {
      resize: 'ionic',         // adds CSS padding equal to keyboard height
      style: 'dark',
      resizeOnFullScreen: false
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'eezybuild'
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#10b981',
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: false
    },
    Permissions: {
      camera: 'EezyBuild uses camera access to scan building documents and take photos for project documentation',
      microphone: 'EezyBuild uses microphone access for voice commands and audio notes',
      notifications: 'EezyBuild sends notifications for project updates, regulatory changes, and important reminders',
      location: 'EezyBuild uses location services to provide relevant local building regulations and find nearby professionals'
    },
    Device: {
      androidHideNavigationBar: false
    },
    Network: {
      enabled: true
    },
    Haptics: {
      enabled: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  ios: {
    backgroundColor: '#000000',
    allowsLinkPreview: false,
    handleApplicationNotifications: true,
    hideLogs: true,
    disallowOverscroll: true,
    enableViewportScale: false,
    allowsInlineMediaPlayback: true,
    suppresessIncrementalRendering: false,
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    minimumFontSize: 12.0,
    contentInset: 'automatic',
    webviewStyle: 'light'
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'EezyBuild',
    overrideUserAgent: '',
    hideLogs: true,
    useLegacyBridge: false
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  }
};

export default config;

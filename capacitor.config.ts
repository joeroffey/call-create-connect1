import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eezybuild.app',
  appName: 'EezyBuild',
  webDir: 'dist',
  bundledWebRuntime: false,
  loggingBehavior: 'none',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#000000',
      style: 'Dark',
      androidStyle: 'DARK'
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true
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
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#10b981",
      sound: "beep.wav"
    },
    Camera: {
      androidPermissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    Storage: {
      iosUseKeychain: true,
      iosKeychainAccessGroup: "com.eezybuild.app.keychain"
    },
    BackgroundMode: {
      enabled: true,
      enabledTypes: ["background-fetch", "background-processing"]
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
    webviewStyle: 'dark',
    scheme: 'eezybuild',
    limitsNavigationsToAppBoundDomains: false,
    allowsBackForwardNavigationGestures: true,
    mediaTypesRequiringUserActionForPlayback: [],
    presentationStyle: 'fullscreen'
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'EezyBuild',
    overrideUserAgent: '',
    hideLogs: true,
    useLegacyBridge: false,
    deepLinkingEnabled: true,
    allowNavigation: [
      "https://eezybuild.com",
      "https://*.supabase.co"
    ],
    enableDiskCaching: true,
    mixedContentMode: "compatibility"
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  }
};

export default config;

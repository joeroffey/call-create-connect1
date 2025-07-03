
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.callcreateconnect',
  appName: 'call-create-connect',
  webDir: 'dist',
  server: {
    url: 'https://www.eezybuild.co.uk',
    cleartext: true
  },
  bundledWebRuntime: false,
  ios: {
    // iPhone-only configuration
    scheme: 'eezybuild',
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    // Force iPhone-only deployment target
    minVersion: '13.0'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#000000',
      style: 'Dark'
    },
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'eezybuild'
      }
    }
  }
};

export default config;

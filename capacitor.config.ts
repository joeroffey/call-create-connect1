
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
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#000000',
      style: 'Dark'
    },
    Keyboard: {
      resize: 'ionic'
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'eezybuild'
      }
    }
  }
};

export default config;

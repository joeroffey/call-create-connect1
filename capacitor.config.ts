
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.callcreateconnect',
  appName: 'call-create-connect',
  webDir: 'dist',
  server: {
    url: 'https://5bc45bc5-4965-43ea-9377-7fc2efe6fd86.lovableproject.com?forceHideBadge=true',
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
    }
  }
};

export default config;

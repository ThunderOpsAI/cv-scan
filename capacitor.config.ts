import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cvscan.app',
  appName: 'CVScan',
  webDir: 'www',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://cvscan.com.au',
    cleartext: false,
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    }
  }
};

export default config;

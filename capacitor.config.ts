import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cvscan.app',
  appName: 'AI CV Scan',
  webDir: 'www',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://www.aicvscan.com',
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

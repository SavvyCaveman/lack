import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lack.app',
  appName: 'LACK',
  webDir: 'dist',
  server: {
    // Use live URL so updates to LACK web app appear instantly in the Android app
    url: 'https://lack-techoverride243923380.adaptive.ai',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;

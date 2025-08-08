/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tgatb.habittracker',
  appName: 'TGATB Habit Tracker',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#6750a4',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#6750a4',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    EdgeToEdge: {
      backgroundColor: "transparent"
    },
    Keyboard: {
      resizeOnFullScreen: false
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;

/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tgatb.habittracker',
  appName: 'TGATB Habit Tracker',
  webDir: 'out',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    StatusBar: {
      // Runtime JS/native plugin will override with theme-aware colors
      style: 'dark', // Dark text for white background
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 1000,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    EdgeToEdge: {
      backgroundColor: "#00000000"
    },
    Keyboard: {
      resizeOnFullScreen: false
    },
    NavigationBar: {}
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;

/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />
/// <reference types="@capacitor-community/safe-area" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tgatb.habittracker',
  appName: 'TGATB Habit Tracker',
  webDir: 'out',
  plugins: {
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: '#6750a4',
      statusBarContent: 'light',
      navigationBarColor: '#6750a4', 
      navigationBarContent: 'light',
      offset: 0
    },
    StatusBar: {
      // Let runtime JS/native plugin force white icons; avoid dark style which produces dark icons on white
      style: 'light',
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
    },
    NavigationBar: {
      height: 0,
      backgroundColor: '#00000000',
      navigationBarColor: '#00000000'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;

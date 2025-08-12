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
      backgroundColor: "#00000000"
    },
    Keyboard: {
      resizeOnFullScreen: false
    },
    NavigationBar: {
      backgroundColor: '#6750a4' // Set default purple, runtime will override
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;

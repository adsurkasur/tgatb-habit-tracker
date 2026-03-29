# Android Capacitor Updates (Current)

This document summarizes the current Android-native behavior that should be considered the source of truth.

## Current Native Runtime Model

- Capacitor version family: 8.x
- Android target/compile SDK: 35
- Soft input mode: `adjustResize`
- System bars orchestration:
  - JS side: `hooks/use-system-bars-unified.ts`
  - Native side: `android/app/src/main/java/com/tgatb/habittracker/SystemUiPlugin.java`
- Keyboard inset handling:
  - Native WebView IME padding bridge in `MainActivity.java`

## What Is Implemented

### 1. Unified System Bar Control

- Single JS hook orchestrates fullscreen and dark/light behavior.
- Native plugin applies fullscreen, icon appearance, and bar color policy.
- Dark-mode seam alignment uses the same dark surface color token (`#201E24`) across app/header/system bars.

### 2. Android 15-Compatible Behavior

- Android 15+ avoids deprecated direct layout-fit calls in runtime flow.
- Insets and appearance are managed through modern insets/controller behavior.
- Older Android versions keep compatibility paths.

### 3. Keyboard and Viewport Stability

- `MainActivity` installs an IME inset listener on the WebView.
- Keyboard visibility adjusts WebView bottom padding dynamically.
- This reduces keyboard slab/gap artifacts in edge-to-edge fullscreen scenarios.

### 4. Premium Haptics Integration

- `PremiumHapticsPlugin` is registered in `MainActivity`.
- Native app can use profile-based haptic responses through JS bridge fallbacks.

## Developer Commands

```bash
npm run android:build
npm run android:sync
npm run android:run
npm run android:open
```

## Validation Checklist

- Verify system bar colors in both dark/light themes.
- Verify fullscreen transition consistency.
- Verify keyboard open/close does not leave ghost slabs.
- Verify haptic settings and runtime behavior on native app.

# Premium Haptics Plugin

## Overview

This project now includes a native-first haptics path named `PremiumHaptics`.

- Android is implemented and registered in `MainActivity`.
- Web falls back to vibration patterns via the existing adapter.
- iOS source file is provided in `mobile/PremiumHapticsPlugin.swift` as the starter implementation for iOS app setup.

## JS Bridge

The app uses `lib/premium-haptics-plugin.ts` with the following methods:

- `isSupported()`
- `setProfile({ profile })`
- `warmup()`
- `play({ event, profile })`

## Android Integration

### Files

- `android/app/src/main/java/com/tgatb/habittracker/PremiumHapticsPlugin.java`
- `android/app/src/main/java/com/tgatb/habittracker/MainActivity.java`
- `android/app/src/main/AndroidManifest.xml`

### Notes

- Plugin is registered in `MainActivity` with `registerPlugin(PremiumHapticsPlugin.class)`.
- `android.permission.VIBRATE` is declared in the manifest.

## iOS Integration Guide

This repository does not currently include an iOS Capacitor project directory.
To enable the same plugin on iOS:

1. Create/sync an iOS Capacitor project (`npx cap add ios` if needed).
2. Add `mobile/PremiumHapticsPlugin.swift` into the iOS app plugin sources.
3. Add plugin registration in iOS plugin registry if needed by your Capacitor version.
4. Build and test on physical iPhone hardware.

## Runtime Usage

Haptics adapter path:

- `lib/haptics.ts`

Behavior:

1. Native Android: prefers `PremiumHaptics.play`.
2. Native fallback: uses `@capacitor/haptics` sequence patterns.
3. Web fallback: uses `navigator.vibrate` patterns.

## Event Model

Supported semantic events:

- `button`
- `selection`
- `navigation`
- `success`
- `streak`
- `undo`
- `failure`
- `warning`
- `error`

Profiles:

- `subtle`
- `balanced`
- `punchy`

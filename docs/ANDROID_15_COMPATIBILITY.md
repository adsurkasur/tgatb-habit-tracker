# Android 15+ Compatibility (Current)

## Overview

Android 15 (API 35) changes edge-to-edge defaults and deprecates some direct system bar color paths.
Current project behavior is compatible with Android 15 and keeps fallback behavior for lower API levels.

## Current Strategy

### 1. System Bar Policy

- JS orchestration: `hooks/use-system-bars-unified.ts`
- Native policy: `android/app/src/main/java/com/tgatb/habittracker/SystemUiPlugin.java`
- Activity bridge: `android/app/src/main/java/com/tgatb/habittracker/MainActivity.java`

### 2. API-Level Handling

- Android 15+: runtime avoids deprecated direct decor-fit control flow and uses insets/controller policy.
- Android 14 and below: compatibility branch still uses legacy safe APIs for color and visibility behavior.

### 3. Keyboard Insets

- `MainActivity` installs WebView IME insets handling.
- WebView padding adjusts based on `WindowInsetsCompat.Type.ime()` visibility.
- This is required to avoid keyboard slab exposure in edge-to-edge contexts.

## Manifest and Soft Input

- Activity uses `android:windowSoftInputMode="adjustResize"`.
- No active `windowOptOutEdgeToEdgeEnforcement` fallback is required in current manifest.

## Validation Matrix

- Android 15+ physical device: fullscreen on/off transitions.
- Android 15+ keyboard open/close in dialogs and inputs.
- Android 14 and below: status/navigation icon contrast and color consistency.
- Theme switching: verify dark/light surface alignment with header colors.

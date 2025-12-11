# Android Capacitor Implementation Updates

This document describes the recent changes made to improve the Android native app experience.

> Audit note (2025-12-12): The repository's Capacitor configuration and status bar changes are present (see `capacitor.config.ts` and `lib/capacitor.ts`). Confirm the Android theme and system UI native plugin are tested on Android 15 devices; the unified JS hook (`hooks/use-system-bars-unified.ts`) is intended to coordinate with native behavior.

## 🔧 Changes Made

### 1. Mobile View Detection
- **File:** `hooks/use-mobile.tsx`
- **Change:** Modified `useIsMobile()` hook to always return `true` when running in Capacitor (native app)
- **Benefit:** Ensures consistent mobile UI experience in the native Android app regardless of device screen size

### 2. Status Bar Configuration
- **Files:** 
  - `lib/capacitor.ts`
  - `hooks/use-status-bar.ts`
  - `capacitor.config.ts`
  - `android/app/src/main/res/values/styles.xml`
- **Changes:**
  - Disabled status bar overlay (`overlaysWebView: false`)
  - Set proper status bar background color (`#ffffff`)
  - Updated CSS custom properties to not add padding for overlays
  - Added Android theme configuration to prevent content overlap
- **Benefit:** Status bar appears above the app content without overlapping, creating a clean separation

### 3. App Icon Setup
- **Files:**
  - `scripts/generate-android-icons.cjs` (new)
  - `scripts/setup-android-icons.cjs` (new)
  - Generated icon files in `android/app/src/main/res/mipmap-*` directories
- **Changes:**
  - Created automated script to convert `public/icons/icon-512x512.svg` to Android PNG icons
  - Generated icons for all required densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
  - Added npm script: `npm run generate-icons`
- **Benefit:** Custom app icon using the project's SVG icon across all Android screen densities

## 📱 Usage

### Regenerating Icons
If you update the SVG icon, run:
```bash
npm run generate-icons
```

### Building Android App
```bash
npm run android:build
npm run android:run
```

## 🎯 Expected Behavior

1. **Mobile UI:** Native app always uses mobile layout regardless of device screen size
2. **Status Bar:** Device status bar appears above app content without overlap
3. **App Icon:** Custom purple icon with checkmark displays in launcher and throughout the system

## 🔧 Technical Details

### Status Bar Configuration
The status bar is configured with:
- `overlaysWebView: false` - Prevents content overlap
- `backgroundColor: '#ffffff'` - White background
- `style: 'dark'` - Dark text/icons for visibility on white background

### Icon Sizes Generated
- **mdpi:** 48x48px
- **hdpi:** 72x72px  
- **xhdpi:** 96x96px
- **xxhdpi:** 144x144px
- **xxxhdpi:** 192x192px

Each density includes:
- `ic_launcher.png` - Main app icon
- `ic_launcher_round.png` - Round variant
- `ic_launcher_foreground.png` - Foreground for adaptive icons

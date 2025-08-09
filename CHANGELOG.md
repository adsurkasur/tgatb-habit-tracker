# Changelog

All notable changes to this project will be documented in this file.

## 0.2.1 - 2025-08-09

Android system bar theming groundwork and minor native tweaks.

### Added / Changed

- Android: Explicit purple (`#6750a4`) system bar colors (status & navigation) defined in native styles; removed translucent flags that caused white fallback.
- Added `navigation_bar_color` resource; launch (splash) theme now sets both bar colors to avoid white flash on startup.
- WebView background set to purple to ensure any transient transparency remains on-brand.
- SystemUi plugin already re-applies purple + white icons on focus/resume; left logic in place for future refinements.

### Deferred / Known Issue

- Emulator (Android 16 preview image) still shows white/gesture area background due to gesture navigation pill area not adopting app navigation bar color under current edge-to-edge configuration. Further investigation (likely involving insets + disabling enforced gesture nav contrast) deferred to a later patch.

### Next

- Revisit navigation gesture pill background & immersive edge in a focused follow-up (0.2.2) with optional fallback to solid 3‑button bar styling.

## 0.2.0 - 2025-08-08

Major update with platform persistence, Android build fixes, and UX improvements:

- Settings persistence: unified, async storage using Capacitor Preferences on native and localStorage on web; saves fullscreen immediately.
- Back navigation: standardized Android behavior with overlay-aware closing and "press back again to exit" on Home.
- Overlay management: centralized modals (drawer, dialogs) with priorities; consistent close logic.
- Replace deprecated @capacitor/storage with @capacitor/preferences; synced native plugins.
- Android build: enforce Java 21 source/target; remove OS-specific gradle JDK path; cross-platform guidance.
- Lint/Type: resolved all ESLint errors and tightened types across components and libs.
- Minor cleanups in PWA install prompt, service worker registration, offline toast, and utilities.

Note: Version 0.1.2 was not officially released. The planned changes for 0.1.2 were consolidated into 0.2.0.

## 0.1.1 - 2025-08-08

- System bar improvements: respected OS navigation bar visibility and refined StatusBar styling.
- Polished Android theming behavior for better consistency.

## 0.1.0 - 2025-08-08

- Initial release.
- Android: edge-to-edge support and navigation bar management to enhance theme responsiveness.

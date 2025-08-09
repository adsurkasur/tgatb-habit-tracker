# Changelog

All notable changes to this project will be documented in this file.

## 0.2.4 - 2025-08-09

**MAJOR SYSTEM BARS FIX** - Complete overhaul of Android system bar styling and fullscreen mode.

### Fixed

- **White-on-white status bar visibility issue**: Corrected `StatusBarStyles.Dark` vs `StatusBarStyles.Light` usage. Now consistently uses `Light` style (white text) on purple background (#6750a4).
- **System bar glitches and race conditions**: Eliminated multiple competing system bar management systems that were fighting for control.
- **Fullscreen mode bugs**: Fixed incomplete fullscreen implementation that only hid status bar. Now properly hides both status and navigation bars with immersive behavior.
- **Edge-to-edge layout conflicts**: Resolved `WindowCompat.setDecorFitsSystemWindows()` conflicts that caused layout issues.

### Added

- **Unified system bar management**: New `useSystemBarsUnified()` hook provides single source of truth for all system bar operations.
- **Robust error handling**: Added graceful fallbacks and recovery mechanisms for system bar failures.
- **Enhanced native plugin**: Improved `SystemUiPlugin.java` with proper synchronization and fullscreen behavior.
- **Comprehensive documentation**: Added detailed fix documentation in `docs/SYSTEM_BARS_FIX.md`.

### Changed

- **Consistent purple theming**: All system bars now use Material Design purple (#6750a4) with white icons/text.
- **Better performance**: Implemented debouncing and proper state management to prevent rapid system bar changes.
- **Android theme improvements**: Updated `styles.xml` with correct light icon flags and window insets handling.

### Deprecated

- **Legacy system bar hooks**: `useSystemBars()` and `useEnhancedFullscreen()` are now replaced by unified implementation.

### Technical Details

- Fixed StatusBar style confusion: `Light` = white text on dark bg, `Dark` = dark text on light bg
- Consolidated 4+ competing system bar systems into single `useSystemBarsUnified()` hook
- Enhanced native `SystemUiPlugin.java` with conditional edge-to-edge and proper fullscreen
- Updated Android themes for consistent purple theming with white icons


## 0.2.3 - 2025-08-09

Release automation polish & deterministic Android artifacts.

### Pipeline Changes

- GitHub Actions: switched from `cap copy` to `cap sync` to regenerate native plugin directory instead of committing generated files.
- Re-ignored `capacitor-cordova-android-plugins` (generated) keeping repo clean.
- Normalized APK artifact naming: `tgatb-vX.Y.Z.apk`, `tgatb-vX.Y.Z-unsigned.apk` (if unsigned release produced), and `tgatb-vX.Y.Z-debug.apk`.
- Build workflow now resilient to missing plugin folder (auto-regenerated) and ensures Gradle plugin resolution via restored `buildscript` repositories.

### Notes

- Next: optional AAB (`bundleRelease`) + checksum generation + automated release notes injection.

## 0.2.2 - 2025-08-09

Focused Android system bar stabilization and CI workflow corrections.

### Changes

- Added `SystemBarInit` root component with multi-pass (timed) enforcement of purple (`#6750a4`) status & navigation bar colors plus white icons to eliminate white-on-white race on cold start.
- Updated Capacitor `StatusBar` plugin config (`style: "light"`) to force white icons over brand purple.
- Re-enabled legacy `useSystemBars` hook on home page for redundant safety until fully confident native + init component cover all lifecycle paths.
- Ensured root layout imports `SystemBarInit` so it runs before most UI paints.

### CI / Workflow

- Preparing GitHub Actions fix for Android release job failures (investigating missing sync / build step nuances); version bump to `0.2.2` for next tag once workflow passes.

### Pending / Next

- If emulator still shows dark icons on white at launch, next step: move color & icon enforcement into native `onCreate` before splash and double-check splash theme status bar icon contrast flags.
- Potential optimization: remove redundant JS enforcement after confirmed stable behavior across resume / orientation / keyboard.

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

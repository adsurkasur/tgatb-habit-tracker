# Changelog

All notable changes to this project will be documented in this file.

## 0.2.9 - 2025-08-11

**Overview:**  
Critical bugfix for import/export functionality and UI wiring. All toast durations unified. Import now updates habits immediately after file selection.

### Fixed (0.2.9)

- Fixed import functionality: file input now reads and passes JSON to import logic, updating habits instantly.
- Wired up `SettingsScreen` to receive and call the correct import handler from `useHabits`.
- Resolved `onImportData is not a function` error by passing the correct prop from parent.
- Unified all toast durations to 3000ms for consistent UX.

### Changes (0.2.9)

- Updated `SettingsScreen` and main app to ensure import/export workflow is robust and user-friendly.

## 0.2.8 - 2025-08-11

**Overview:**  
Release workflow improvements, APK signing fixes, and minor bug fixes.

### Added (0.2.8)

- Added support for triggering release workflow on test tags.
- Simplified release signing configuration with a fixed keystore path.
- Updated signing configuration to copy keystore for compatibility and improved error handling.
- Release workflow now verifies APK signature before uploading to GitHub Release.

### Changes (0.2.8)

- Streamlined APK normalization process in release workflow.
- Removed support for triggering workflow on test tags (now handled differently).
- Updated version to 0.2.8.
- Removed duplicate back button listener to avoid navigation conflicts and improve stability.

### Fixed (0.2.8)

- Corrected variable assignment for APK signature verification.

## 0.2.7 - 2025-08-10

**Overview:**  
Major improvements to data export, navigation, and habit management. Enhanced performance and debugging for HabitCard, and improved Android versioning automation.

### Added (0.2.7)

- Integrated `capacitor-save-as` plugin for enhanced data export functionality.
- Added debounce utility for robust event handling in export function.
- Added npm run test script.

### Changes (0.2.7)

- Updated version of `capacitor-save-as` to 0.1.6 in dependencies.
- Updated versioning in `build.gradle` and `package.json`; added script to sync version codes.
- Replaced upver script with syncver for Android versioning automation.
- Unified habit management functions and removed unused importData method.
- Enhanced mobile navigation with dedicated buttons and updated instructions.
- Improved navigation direction handling and synchronized direction reset with animation duration.
- Updated habit navigation to use event-based system for animations.
- Enhanced HabitCard memoization logic to prevent unnecessary re-renders.
- Optimized HabitCard component by memoizing to prevent unnecessary re-renders.
- Improved logging mechanism in HabitCard for better debugging.
- Conditionally log service worker events and animations in development mode.

## 0.2.6 - 2025-08-09

**Overview:**  
Swapped icons for export and import data actions in settings (7a59380).

### Changes (0.2.6)

- Swapped icons for export and import data actions in settings (7a59380).

## 0.2.5 - 2025-08-09

**Overview:**  
Refactored Android SystemUiPlugin for improved edge-to-edge and fullscreen handling. Enhanced proguard rules, build configuration, and project metadata. Deprecated legacy fullscreen hook.

### Changes (0.2.5)

- Refactored Android SystemUiPlugin for improved edge-to-edge and fullscreen handling.
- Enhanced proguard rules for Capacitor, WebView, and reflection-based plugins.
- Updated Android build configuration: enabled R8 shrinking, resource shrinking, and improved signing config placeholders.
- Deprecated `useEnhancedFullscreen` hook in favor of `useSystemBarsUnified` for unified system bar control.
- Refactored `use-system-bars-unified.ts` for better maintainability and clarity.
- Improved project metadata in `package.json` (repository, bugs, homepage, engines).

### Documentation (0.2.5)

- Improved overall project documentation and accessibility for contributors and users.

## 0.2.4 - 2025-08-09

**Overview:**  
Complete overhaul of Android system bar styling, fullscreen mode, and edge-to-edge support.

### Major System Bars Fix (0.2.4)

Complete overhaul of Android system bar styling, fullscreen mode, and edge-to-edge support.

### Added (0.2.4)

- Unified system bar management: new `useSystemBarsUnified()` hook consolidates all system bar logic.
- Robust error handling for system bar failures.
- Comprehensive documentation in `docs/SYSTEM_BARS_FIX.md`.
- Enhanced native plugin: improved `SystemUiPlugin.java` for proper synchronization and fullscreen behavior.
- Safe Area plugin integration for better edge-to-edge and system bar handling.

### Changes (0.2.4)

- All system bars now use Material Design purple (#6750a4) with white icons/text for consistent theming.
- Debouncing and proper state management to prevent rapid system bar changes.
- Updated Android theme (`styles.xml`) for correct light icon flags and window insets.
- Refactored and removed legacy Safe Area plugin and navigation bar plugin integrations.

### Fixed (0.2.4)

- White-on-white status bar visibility issue: consistently uses `Light` style (white text) on purple background.
- System bar glitches and race conditions: removed multiple competing management systems.
- Fullscreen mode bugs: now properly hides both status and navigation bars with immersive behavior.
- Edge-to-edge layout conflicts: resolved `WindowCompat.setDecorFitsSystemWindows()` issues.
- Status bar handling for Android 15+: restored proper insets listener to avoid height duplication.

### Deprecated (0.2.4)

- Legacy system bar hooks: `useSystemBars()` and `useEnhancedFullscreen()` replaced by unified implementation.

### Technical Details (0.2.4)

- Fixed StatusBar style confusion: `Light` = white text on dark bg, `Dark` = dark text on light bg.
- Consolidated 4+ competing system bar systems into single hook.
- Enhanced native plugin for conditional edge-to-edge and proper fullscreen.
- Updated Android themes for consistent purple theming with white icons.

## 0.2.3 - 2025-08-09

**Overview:**  
Release automation polish & deterministic Android artifacts.

### Pipeline Changes (0.2.3)

- GitHub Actions: switched from `cap copy` to `cap sync` to regenerate native plugin directory instead of committing generated files.
- Re-ignored `capacitor-cordova-android-plugins` (generated) keeping repo clean.
- Normalized APK artifact naming: `tgatb-vX.Y.Z.apk`, `tgatb-vX.Y.Z-unsigned.apk` (if unsigned release produced), and `tgatb-vX.Y.Z-debug.apk`.
- Build workflow now resilient to missing plugin folder (auto-regenerated) and ensures Gradle plugin resolution via restored `buildscript` repositories.

### Notes (0.2.3)

- Next: optional AAB (`bundleRelease`) + checksum generation + automated release notes injection.

## 0.2.2 - 2025-08-09

**Overview:**  
Focused Android system bar stabilization and CI workflow corrections.

### Changes (0.2.2)

- Added `SystemBarInit` root component with multi-pass (timed) enforcement of purple (`#6750a4`) status & navigation bar colors plus white icons to eliminate white-on-white race on cold start.
- Updated Capacitor `StatusBar` plugin config (`style: "light"`) to force white icons over brand purple.
- Re-enabled legacy `useSystemBars` hook on home page for redundant safety until fully confident native + init component cover all lifecycle paths.
- Ensured root layout imports `SystemBarInit` so it runs before most UI paints.

### CI / Workflow (0.2.2)

- Preparing GitHub Actions fix for Android release job failures (investigating missing sync / build step nuances); version bump to `0.2.2` for next tag once workflow passes.

### Pending / Next (0.2.2)

- If emulator still shows dark icons on white at launch, next step: move color & icon enforcement into native `onCreate` before splash and double-check splash theme status bar icon contrast flags.
- Potential optimization: remove redundant JS enforcement after confirmed stable behavior across resume / orientation / keyboard.

## 0.2.1 - 2025-08-09

**Overview:**  
Android system bar theming groundwork and minor native tweaks.

### Added / Changes (0.2.1)

- Android: Explicit purple (`#6750a4`) system bar colors (status & navigation) defined in native styles; removed translucent flags that caused white fallback.
- Added `navigation_bar_color` resource; launch (splash) theme now sets both bar colors to avoid white flash on startup.
- WebView background set to purple to ensure any transient transparency remains on-brand.
- SystemUi plugin already re-applies purple + white icons on focus/resume; left logic in place for future refinements.

### Deferred / Known Issue (0.2.1)

- Emulator (Android 16 preview image) still shows white/gesture area background due to gesture navigation pill area not adopting app navigation bar color under current edge-to-edge configuration. Further investigation (likely involving insets + disabling enforced gesture nav contrast) deferred to a later patch.

### Next (0.2.1)

- Revisit navigation gesture pill background & immersive edge in a focused follow-up (0.2.2) with optional fallback to solid 3‑button bar styling.

## 0.2.0 - 2025-08-08

**Overview:**  
Major update with platform persistence, Android build fixes, and UX improvements.

### Changes (0.2.0)

- Settings persistence: unified, async storage using Capacitor Preferences on native and localStorage on web; saves fullscreen immediately.
- Back navigation: standardized Android behavior with overlay-aware closing and "press back again to exit" on Home.
- Overlay management: centralized modals (drawer, dialogs) with priorities; consistent close logic.
- Replace deprecated @capacitor/storage with @capacitor/preferences; synced native plugins.
- Android build: enforce Java 21 source/target; remove OS-specific gradle JDK path; cross-platform guidance.
- Lint/Type: resolved all ESLint errors and tightened types across components and libs.
- Minor cleanups in PWA install prompt, service worker registration, offline toast, and utilities.

**Note:** Version 0.1.2 was not officially released. The planned changes for 0.1.2 were consolidated into 0.2.0.

## 0.1.1 - 2025-08-08

**Overview:**  
System bar improvements and Android theming polish.

### Changes (0.1.1)

- System bar improvements: respected OS navigation bar visibility and refined StatusBar styling.
- Polished Android theming behavior for better consistency.

## 0.1.0 - 2025-08-08

**Overview:**  
Initial release.

### Changes (0.1.0)

- Initial release.
- Android: edge-to-edge support and navigation bar management to enhance theme responsiveness.

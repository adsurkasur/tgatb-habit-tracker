# Changelog

All notable changes to this project will be documented in this file.

## 0.3.6.2 - 2025-10-13

**Overview:**
Patch release improving auto-sync reliability and UX. This update hardens the automatic cloud sync engine, reduces noisy toasts during background operations, and integrates the global loading overlay for clearer progress feedback.

### Improvements (0.3.6.2)

- **Robust Auto-Sync:** Added a sync mutex to prevent concurrent pushes, exponential backoff with jitter and capped retries for transient failures, and persisted pending sync state so retries survive app restarts.
- **Network-aware retries:** Pending syncs are automatically retried when the device regains connectivity (silent background retry by default).
- **Loading overlay for sync:** Global loading overlay is shown during sync operations to provide consistent feedback; this can be suppressed for silent/background retries.
- **Toast UX:** Coalesced success toasts to avoid repetition, and suppressed duplicate import + autosync toasts. Background retries are quieter and show a single aggregated failure message.
- **Auth handling:** Special-case handling for Drive 401 responses — retries stop and user is prompted to re-authenticate; mobile behavior clears invalid tokens on 401 as implemented previously.
- **API additions:** `pushNow` now accepts options (`payload`, `showToast`, `force`) to distinguish manual vs background syncs.

### Files Modified

- `hooks/use-cloud-sync.ts` — added backoff, persistence, mutex, loading integration, and toast coalescing.
- `hooks/use-habits.ts` — suppressed autosync toast after import to avoid duplicate toasts.

### Notes

- Manual/forced syncs still show toasts by default. Persisted storage keys used: `syncPending` and `syncFailedCount`.


## 0.3.6.1 - 2025-10-12

**Overview:**
Small patch release to fix Android Google Drive authorization failures and prepare the repository for an automated APK release.

### Fixes (0.3.6.1)

- **Android Drive 401 / OAuth:** Added mitigation + diagnostics for Android-only Drive 401s (clear invalid stored access token on 401, improved logs) and updated mobile Google sign-in debug warnings. Root cause addressed by updating the Android OAuth configuration (SHA-1 fingerprint added) and replacing `google-services.json` for the Android app.

- **Release prep:** Uploaded updated `google-services.json` and the `release.keystore` (base64) to the repository (for CI use) and prepared the GitHub Actions workflow to publish `0.3.6.1` APK. Follow-up: confirm CI secrets and workflow decode steps are correct before final release.

### Notes

- This is a small compatibility & release-prep patch only; web/PWA behaviour is unchanged.


## 0.3.6 - 2025-10-12

**Overview:**
This release introduces auto-sync functionality for cloud data, implements a global loading overlay system, and includes various UX improvements and technical updates.

### Features (0.3.6)

- **Auto-Sync for Cloud Data:** Added automatic synchronization option for cloud habit data to keep user data up-to-date across devices.
- **Global Loading Overlay:** Implemented a comprehensive loading overlay and context system to provide consistent progress feedback across long-running operations.
- **Enhanced Loading Feedback:** Added explicit loading indicators during cloud backup and data export processes for better user experience.

### Improvements (0.3.6)

- **Modal UX Enhancements:** Improved modal user experience with better loading states and global loading feedback integration.
- **Habit Selection UX:** Enhanced habit selection interface and improved focus handling for add habit input.
- **Settings Organization:** Moved fullscreen and install app controls to a new dedicated "App & Device" settings section for better organization.
- **UI Consistency:** Unified CTA button hover effects with the cta-color-hover utility for consistent styling.

### Fixes (0.3.6)

- **Toast Visibility:** Increased z-index of ToastViewport to ensure toast notifications remain visible above new overlays and UI elements.

### Technical Updates (0.3.6)

- **TypeScript Configuration:** Updated TypeScript settings to ignore deprecations for versions 5.0 and 6.0.
- **Code Quality:** Refactored error handling in DonationDialog, removed unused variables, and cleaned up ESLint disable comments.
- **Dependencies:** Updated project dependencies and aligned tooling for latest support.

## 0.3.5.11 - 2025-10-10

**Overview:**
Small UX and settings refinements, loading/feedback improvements, navigation search, and a few bugfixes to improve discoverability and reliability.

### UX & Settings (0.3.5.11)

- Moved device-related controls into clearer places: Fullscreen Mode was relocated to the Appearance card and the Install App control was extracted into a new "App & Device" settings card for accurate labeling and discoverability.
- Added `App & Device` settings card to separate app-install and device-specific controls from account and backup actions.

### Loading & Feedback (0.3.5.11)

- Implemented a global loading overlay and context to provide consistent progress feedback across long-running actions (cloud backup, data export, destructive operations).
- Added explicit loading feedback during cloud backup and data export flows.
- Improved modal UX to better show and handle loading states.

### Navigation & Habits (0.3.5.11)

- Added a search/filter field in the navigation drawer to filter visible habits (good / bad) for faster navigation.
- Simplified habit selection logic by unifying habit arrays and streamlining selection behavior.

### Fixes (0.3.5.11)

- Increased the z-index of the ToastViewport so toast notifications remain visible above new overlays and loading UI.

## 0.3.5.10 - 2025-10-07

**Overview:**
Swipe-to-switch-habit-card gesture is now only active within the main content area, not globally.

### UI/UX (0.3.5.10)

- **Habit Card Navigation:**
  - Swiping left or right to switch habits now only works when the gesture starts inside the main content area (below the header).
  - Swipes on the header or outside the main area no longer trigger habit navigation.
  - This prevents accidental habit switching and improves UX on mobile and desktop.

---

## 0.3.5.9 - 2025-10-07

**Overview:**
QRIS (Support Me) modal now provides a native-feeling download experience for the QRIS image on Android/iOS, and its header/layout is fully consistent with other dialogs.

### UI Consistency & Native Download (0.3.5.9)

- **QRIS Modal:**
  - Header, close button, and layout now match the About dialog for full modal consistency.
  - Download button uses Capacitor's `capacitor-save-as` plugin to save the QRIS image on native apps (Android/iOS), with a toast for success/failure.
  - On web/PWA, download uses the standard anchor method as before.
  - Users always receive a toast notification for download success or failure.

## 0.3.5.8 - 2025-10-07

**Overview:**
Restricts fullscreen mode toggle to native mobile app only, adds toast warning, and standardizes toast duration.

### UI & Settings (0.3.5.8)

- **Fullscreen Mode:**
  - Fullscreen mode toggle is now only interactable in the native mobile app (Android/iOS via Capacitor).
  - Toggle and row are completely disabled/uninteractable on web/PWA.
  - If settings are loaded with fullscreen enabled on web, it is automatically set to disabled.
- **Toast Warning:**
  - When enabling fullscreen mode, a toast appears: "Fullscreen mode may not display perfectly on all devices. If you notice issues, you can turn it off in settings."
- **Toast Duration:**
  - All toast durations are now standardized to 3000ms for consistent UX.

## 0.3.5.7 - 2025-10-07

**Overview:**
Ran npm install and npm update.

### Internal (0.3.5.7)

- Ran npm install to ensure the latest version of packages are installed, especially capacitor-save-as.
- Ran npm update to ensure the latest version of packages are installed, especially capacitor-save-as.

**Overview:**
Updated to the latest version of capacitor-save-as plugin for improved compatibility and future support.

### Internal (0.3.5.6)

- Upgraded capacitor-save-as to the latest release in package.json
- No functional changes; release is for dependency update and workflow validation

## 0.3.5.5 - 2025-10-07

**Overview:**
Version bump to trigger workflow after updating capacitor-save-as plugin for Android SDK compatibility.

### Internal (0.3.5.5)

- Updated capacitor-save-as plugin to use compileSdkVersion 35 in [this repo here](https://github.com/adsurkasur/capacitor-save-as)
- No functional changes; release is for workflow validation

## 0.3.5.4 - 2025-10-07

**Overview:**
This patch fixes the Android release workflow by ensuring gradlew has executable permissions in CI.

### CI/CD & Workflow (0.3.5.4)

- **Android Release Workflow:**
  - Added step to set executable permissions on gradlew before running clean
  - Resolved "Permission denied" error for ./gradlew in GitHub Actions
  - Improved reliability of Android build and release automation

## 0.3.5.3 - 2025-10-07

**Overview:**
This patch fixes a YAML syntax error in the Android release workflow and documents manual workflow improvements.

### CI/CD & Workflow (0.3.5.3)

- **Android Release Workflow:**
  - Fixed YAML indentation error on line 69 in `.github/workflows/release-android.yml`
  - Unindented Gradle cache and clean steps for valid workflow execution
  - Improved reliability and maintainability of release automation

### Internal (0.3.5.3)

- Documented manual workflow edits and validation steps

## 0.3.5.2 - 2025-10-07

**Overview:**
This release standardizes the About dialog header and close button implementation for UI consistency.

### UI Consistency & Dialogs (0.3.5.2)

- **About Dialog:**
  - Header structure now matches Support Me (Donation) dialog
  - Manual "X" close button added to header, floating close button hidden
  - Improved accessibility and alignment

### Internal, Refactoring & Workflow (0.3.5.2)

- **Android Build Workflow:**
  - Updated GitHub Actions workflow to clear Gradle and npm caches before build
  - Added explicit `gradle clean` step to resolve build errors
  - Improved reliability of Android release builds
- Removed unused imports and redundant close button logic from About dialog
- Ensured dialog content matches shared modal patterns

## 0.3.5.1 - 2025-10-07

**Overview:**
This patch release focuses on code quality and type safety improvements, ensuring optimal performance and maintainability.

### Fixes & Improvements (0.3.5.1)

- **Lint Warning Resolved:**
  - Replaced `<img>` with Next.js `<Image />` in donation dialog for better LCP and image optimization
- **Type Safety:**
  - Updated habit log types to allow `completed: boolean | null` for untracked days
  - Fixed type errors in history dialog and related components

### Internal & Build (0.3.5.1)

- Improved type definitions for habit logs and editing
- Ensured all builds and lints pass with zero warnings or errors

## 0.3.5 - 2025-10-06

**Overview:**
This release brings major UI polish, new donation method support, and improved interaction handling. Scrollbars are now globally themed, donation options are expanded, and habit log clarity is improved.

### Features & Improvements (0.3.5)

- **Global Scrollbar Styling:**
  - Added thin, purple, rounded scrollbars across the app, adapting to light and dark themes

- **Donation Dialog Enhancements:**
  - Added QRIS donation method with modal image display and download functionality
  - Improved thank you message layout for donations

- **Habit Log UI:**
  - Untracked log entries now show a grey color and question mark icon for clarity

- **Touch Event Handling:**
  - Enhanced swipe logic to ignore toast notification swipes, preventing accidental dismissals

- **Legal & Info:**
  - Updated contact email in Terms of Service

### Internal & Build (0.3.5)

- Improved code structure for donation dialog and habit log UI
- Refined theme variable usage for consistent styling

## 0.3.4.3 - 2025-09-28

**Overview:**
This patch release fixes Android cloud export/import functionality by implementing proper network status detection for mobile devices.

### Fixes (0.3.4.3)

- Added Capacitor Network plugin for accurate network connectivity detection on Android
- Fixed cloud export/import operations that were blocked due to incorrect offline detection
- Improved network status handling across all platforms with proper fallbacks

### Internal & Build (0.3.4.3)

- Implemented Capacitor Network plugin for native platforms
- Maintained browser-based detection for web platforms
- Added proper error handling and fallback mechanisms

## 0.3.4.2 - 2025-09-28

**Overview:**
This micro patch improves user experience clarity by refining status messaging in habit cards.

### Improvements (0.3.4.2)

- **Habit Card Status Text:**
  - Changed "Not Completed" to "Missed" for better clarity and conciseness
  - Improved user understanding of habit completion status

## 0.3.4.1 - 2025-09-28

**Overview:**
This patch release enhances the user interface with improved responsive design and smooth animations. It introduces differentiated settings screens for desktop and mobile, along with polished modal transitions throughout the app.

### Features (0.3.4.1)

- **Responsive Settings Screen:**
  - Desktop users now see a modal dialog for settings instead of full-screen overlay
  - Mobile users continue to experience the familiar full-screen slide-in navigation
  - Automatic switching based on screen size and device type

- **Enhanced Modal Animations:**
  - Added smooth slide-in/slide-out animations to all modal dialogs
  - Consistent 200ms transition timing with fade and zoom effects
  - Improved visual polish and professional feel across the application

### Refactoring (0.3.4.1)

- **Settings Component Architecture:**
  - Created `ResponsiveSettings` wrapper component for adaptive UI
  - Introduced `SettingsDialog` component for desktop modal experience
  - Maintained `SettingsScreen` for mobile full-screen navigation

- **Modal Animation System:**
  - Enhanced `MobileDialogContent` with slide transition animations
  - Unified animation behavior across all modal components
  - Improved animation consistency and performance

### Internal & Build (0.3.4.1)

- **Component Structure:**
  - Better separation of mobile and desktop UI patterns
  - Improved component reusability and maintainability
  - Enhanced responsive design architecture

## 0.3.4 - 2025-09-28

**Overview:**
This release focuses on code quality improvements, enhanced development experience, and new habit tracking features. It includes significant refactoring for better maintainability and adds cloud backup/import functionality.

### Features (0.3.4)

- **Cloud Backup & Import:**
  - Added account data settings component with cloud backup functionality
  - Implemented import/export capabilities for user data
  - Enhanced data portability and backup options

- **Habit Logging Enhancements:**
  - Added ability to edit and add habit logs for any date
  - Improved calendar interaction for habit tracking
  - Better date validation and handling

### Fixes (0.3.4)

- **PWA Development Experience:**
  - Disabled PWA in development mode to eliminate `InjectManifest` warnings during development
  - Added clear instructions for enabling PWA testing when needed
  - Improved service worker registration error handling

### Refactoring (0.3.4)

- **Calendar Component:**
  - Refactored `CalendarTabContent` for improved readability and maintainability
  - Enhanced habit status display with better conditional rendering
  - Improved no data message handling and layout
  - Modularized `AddEntryButton` component

- **Service Worker Registration:**
  - Cleaned up service worker registration component
  - Removed unnecessary code and improved error handling

- **Code Structure:**
  - General code structure improvements for better readability
  - Enhanced maintainability across multiple components

### Internal & Build (0.3.4)

- **Build Configuration:**
  - Updated `.gitignore` for Next.js + Capacitor + PWA project
  - Improved build file exclusions and repository cleanliness

- **Development:**
  - Enhanced development workflow with cleaner console output
  - Better error handling and debugging capabilities

## 0.3.3 - 2025-08-15

**Overview:**
This is a comprehensive release focused on improving PWA functionality, user feedback, and overall stability. It includes a significant refactoring of the Firebase integration, enhanced offline support, and numerous fixes and documentation updates.

### Features (0.3.3)

- **PWA Installation Experience:**
  - The UI now updates instantly upon PWA installation without requiring a page refresh.
  - Enhanced installation prompts with clearer, platform-specific instructions and better user feedback.

- **Offline Handling:**
  - Added network status checks to prevent cloud-based actions (login, import/export) when the user is offline.
  - Clear toast notifications are shown to inform the user when an action cannot be completed due to a lack of network connectivity.

### Fixes (0.3.3)

- **PWA & Service Worker:**
  - Resolved issues with PWA functionality and improved service worker error handling.
  - Fixed all outstanding ESLint warnings, including unused variables in the service worker registration.

- **Type Safety:**
  - Fixed an issue where the Firebase `app` instance had an implicit `any` type, improving type safety throughout the app.

### Refactoring (0.3.3)

- **Firebase Initialization:** Replaced the `FirebaseErrorBoundary` with a more robust `FirebaseInitializer` component for consolidated and stable Firebase setup.

- **Settings Screen:** The "Install App" button is now visually disabled and its text updates to "App Installed" when the PWA is already installed, providing clearer feedback to the user.

- **Code Structure:** Refactored parts of the codebase for improved readability and maintainability.

### Documentation (0.3.3)

- **README:** Added a Table of Contents and improved the display of the project logo for better readability.

### Internal & Build (0.3.3)

- **Build Configuration:**
  - Enabled PWA support for Android builds.
  - Added generated build files (`sw.js`, etc.) to `.gitignore` to keep the repository clean.

- **Development:**
  - Removed debugging console logs from the production build.
  - Added a "Beast Mode" chatmode for development.
  - Updated `package-lock.json`.

## 0.3.2 - 2025-08-12

**Overview:**
This release enhances data import/export functionality with improved validation and user feedback, and adds necessary dependencies for future integrations.

### Features (0.3.2)

- **Data Import/Export:** Implemented full bundle handling and validation for data import and export, ensuring data integrity.

- **Improved Feedback:** Enhanced error handling for backup and import processes with detailed user feedback via toasts.

### Internal (0.3.2)

- Added Facebook Android SDK dependencies and ProGuard rules for future integrations.

## 0.3.1 - 2025-08-12

**Overview:**
This release focused on unifying system-level UI components and improving data export capabilities.

### Features (0.3.1)

- **Unified System Bars:** Implemented a unified system bar approach for a more consistent look and feel across the application.

- **Platform-Specific Export:** Added a platform-specific export utility for more robust data handling.

### Refactoring (0.3.1)

- **Type Safety:** Enhanced type safety and TypeScript compatibility for web data export.

## 0.3.0 - 2025-08-11

**Overview:**
This release focuses on integrating Firebase authentication and Google Drive for cloud backup and restore. It also includes significant improvements to error handling and the overall user experience.

### Features (0.3.0)

- **Google Sign-In:** Users can now sign in with their Google account on both web and mobile platforms.

- **Cloud Backup & Restore:** Added functionality to export and import user data to/from Google Drive.

- **Firebase Integration:** Integrated the Firebase SDK for authentication and future cloud services.

### Fixes (0.3.0)

- **Graceful Error Handling:** Implemented more user-friendly error messages for common issues like "No credentials available" and "Not signed in".

- **UI Improvements:** Various UI tweaks to improve the user experience.

### Refactoring (0.3.0)

- **Habit Management:** Refactored habit management logic for better performance and maintainability.

- **Theme Handling:** Improved theme handling for a more consistent look and feel.

## 0.2.11 - 2025-08-11

**Overview:**
Improved habit creation and navigation experience.

### Added / Changed (0.2.11)

- When adding a new habit, the app now immediately displays the new habit card and jumps to it in the main view.

- Navigation drawer now supports jump-to-habit selection, allowing users to quickly switch to any habit from the drawer.

### Fixed (0.2.11)

- Ensured new habit is shown instantly after creation.

- Improved navigation logic for more intuitive habit selection.

## 0.2.10 - 2025-08-11

**Overview:**
Patch release: improved support metadata and dynamic usage in UI.

### Changes (0.2.10)

- Switched to separate `author` and `email` fields in `package.json` for support metadata.

- Updated `settings-screen.tsx` to use both support author and email dynamically from metadata (no hardcoded values).

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

# Changelog

All notable changes to this project will be documented in this file.

## 0.2.0 - 2025-08-08

Major update with platform persistence, Android build fixes, and UX improvements:

- Settings persistence: unified, async storage using Capacitor Preferences on native and localStorage on web; saves fullscreen immediately.
- Back navigation: standardized Android behavior with overlay-aware closing and "press back again to exit" on Home.
- Overlay management: centralized modals (drawer, dialogs) with priorities; consistent close logic.
- Replace deprecated @capacitor/storage with @capacitor/preferences; synced native plugins.
- Android build: enforce Java 21 source/target; remove OS-specific gradle JDK path; cross-platform guidance.
- Lint/Type: resolved all ESLint errors and tightened types across components and libs.
- Minor cleanups in PWA install prompt, service worker registration, offline toast, and utilities.

## 0.1.2 - 2025-08-07

Feature expansion, PWA/offline foundation, onboarding, and initial Android integration:

- PWA/Offline:
	- Introduced custom Service Worker with caching strategies, offline fallback, and background sync.
	- Added offline toast/indicator components and improved error handling while offline.
	- Smarter PWA install prompt with better layout and client-side event handling.
- Onboarding and UX:
	- Implemented Welcome Overlay with multi-step guided tour and viewport-aware positioning.
	- “Help” action in Navigation Drawer to reset/show the tour on demand.
- Features and UI:
	- Added History dialog with daily/weekly stats and timeline view.
	- Added Donation dialog and About dialog; unified dialog content patterns.
	- Navigation Drawer enhancements: habit lists, editing/deletion, and polished animations.
	- Numerous mobile dialog improvements (full-screen mobile layout, keyboard detection, touch handling).
	- Refined habit animations, hover states, and overall theme consistency.
- Data & correctness:
	- Local timezone date formatting for logs and statistics.
	- Improved statistics calculations (filter by creation date; accurate daily/weekly counts).
- Android (initial):
	- Added Capacitor Android project, build scripts, and Android release workflow.
	- Introduced initial Java 21 configuration for Android builds and debug APK naming.

## 0.1.1 - 2025-07-30

- Initial public preview with basic habit tracking, Next.js App Router migration, and PWA support.

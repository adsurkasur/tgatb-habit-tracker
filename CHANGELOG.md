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

Note: Version 0.1.2 was not officially released. The planned changes for 0.1.2 were consolidated into 0.2.0.


## 0.1.1 - 2025-08-08

- System bar improvements: respected OS navigation bar visibility and refined StatusBar styling.
- Polished Android theming behavior for better consistency.

## 0.1.0 - 2025-08-08

- Initial release.
- Android: edge-to-edge support and navigation bar management to enhance theme responsiveness.

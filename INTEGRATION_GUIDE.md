## TGATB Habit Tracker: Google Auth & Drive Sync Integration Guide

### Overview

This guide documents how the project integrates Google authentication and Google Drive backups for web and mobile, points to the implementation files, and highlights known risks and recommended precautions.

### Where the code lives

- Web Drive/auth helpers: `web/drive-sync.ts`
- Mobile Drive/auth helpers: `mobile/drive-sync.ts`
- Cloud sync orchestration: `hooks/use-cloud-sync.ts`, `hooks/use-cloud-backup.ts`
- Shared schema & validation: `shared/schema.ts`, `lib/validate-export-import.ts`
- Local persistence: `lib/habit-storage.ts`, `lib/platform-storage.ts`
- Firebase initializer (analytics/auth): `components/firebase-initializer.tsx`

### Authentication & Scopes

- The app uses Firebase Authentication (Google Sign-In) on both web and mobile platforms.
- Web uses `signInWithPopup` from Firebase JS SDK to obtain access tokens.
- Mobile uses `@capacitor-firebase/authentication` with `useCredentialManager: false` (required for obtaining OAuth access tokens when extra scopes like Drive are requested).
- The implementation expects an access token with Drive file scope (`https://www.googleapis.com/auth/drive.file`).
- Auth cancellations (popup closed, back button) are detected and silently ignored — see `isAuthCancellation()` in `hooks/use-auth.ts`.

### Backup / Restore Flow (current behavior and updates)

- Export: `lib/habit-storage.ts` exports the full data bundle (habits, logs, metadata) validated by `shared/schema.ts`.
- Upload/Download: `web/drive-sync.ts` / `mobile/drive-sync.ts` perform multipart uploads/downloads of the export bundle to Google Drive and return Drive file metadata.

### Recent improvements

- A migration runner has been added in `lib/migrations/` and is executed on import to upgrade older bundles before validation.
- A three-way merge utility and per-item merge integration were implemented and wired into `hooks/use-cloud-sync.ts`. The pull flow runs migrations, three-way merges using the last known snapshot as the base, and collects conflicts for user resolution instead of silently overwriting local data.
- A conflict-resolution UI exists to let users resolve per-field conflicts when automatic merging is ambiguous.

### Important Caveats & Risks (updated)

- The sync flow now performs conservative merges instead of immediate destructive overwrites, but the UI and UX around conflict resolution should be validated with real multi-device scenarios.
- Pushes still currently upload the full bundle; consider delta/patched uploads to reduce bandwidth and improve merge fidelity.

### Recommendations (next steps)

- Validate the merge and migration behavior with end-to-end tests simulating multiple devices and concurrent edits.
- Polish the conflict-resolution UX and add clear user guidance (when and how to resolve conflicts) and an audit log of resolved conflicts.
- Add pre-migration backup prompts for manual restores, and ensure the app writes automatic backups prior to major migrations.
- Gate analytics and tracking on explicit user consent; verify the `components/firebase-initializer.tsx` behavior in QA.

### Testing & Deployment notes

- Test Drive uploads/downloads on real devices for mobile flows (OAuth and native plugins behave differently on emulators).
- Configure OAuth client IDs and redirect URIs in Google Cloud Console and in your hosting platform for web flows.

### Suggested next steps

1. Review `hooks/use-cloud-sync.ts` and `web/drive-sync.ts` to design a merge strategy.
2. Add migration scaffolding in `lib/` and unit tests around `shared/schema.ts` validators.
3. Add clear UI for manual export/restore and confirm-before-import.

Repository housekeeping: a filtered `TODO|FIXME` scan has been run and results are consolidated in `docs/TODOs.md`.

Next recommended actions:

- Add E2E multi-device sync tests.
- Polish conflict-resolution UX with clear user guidance.

---

## Web Setup

### Dependencies

The web platform uses Firebase JS SDK directly (no NextAuth.js):

- `firebase` — Firebase Auth (`signInWithPopup`) and app initialization
- Google Drive REST API called directly with OAuth access tokens

### Google Auth Logic

File: `web/google-auth.ts`

- Uses Firebase `signInWithPopup` with `GoogleAuthProvider` to sign in and obtain access tokens.
- Errors propagate to the caller for proper classification (cancellation vs. failure).

### Drive Sync Logic

File: `web/drive-sync.ts`

- Uploads habit data to Drive using REST API and access token.
- Downloads habit data from Drive using REST API and access token.
- Uses shared helpers for serialization/deserialization.

---

## Mobile Setup (Capacitor)

### Dependencies

```bash
npm install @capacitor-firebase/authentication firebase
npx cap sync
```

### Firebase Setup

- Enable Google provider in Firebase Console.
- Configure plugin in `capacitor.config.ts` with `skipNativeAuth: false` and `providers: ["google.com"]`.

### Google Auth Logic

File: `mobile/google-auth.ts`

- Uses `@capacitor-firebase/authentication` with `useCredentialManager: false` (Credential Manager API doesn't return OAuth access tokens when extra scopes like Drive are requested).
- Errors propagate to the caller for proper classification.

### Drive Sync Logic

File: `mobile/drive-sync.ts`

- Uploads habit data to Drive using REST API and access token.
- Downloads habit data from Drive using REST API and access token.
- Uses shared helpers for serialization/deserialization.

### Example Usage

```typescript
import { signInWithGoogle } from './google-auth';
const result = await signInWithGoogle();

import { uploadHabitsToDrive, downloadHabitsFromDrive } from './drive-sync';
const fileId = await uploadHabitsToDrive(habits, result.accessToken);
const habits = await downloadHabitsFromDrive(fileId, result.accessToken);
```

---

## Shared Logic

File: `shared/schema.ts`

- Defines export bundle schema with Zod validation.
- Shared types for habits, logs, and metadata.

---

## Integration Flow

- Web and mobile platforms use shared schema and validation for habit data export/import.
- Web uses Firebase Auth (`signInWithPopup`); mobile uses `@capacitor-firebase/authentication`.
- Both platforms call the Google Drive REST API directly with OAuth access tokens.
- Three-way merge with conflict resolution handles concurrent edits across devices.

---

## Troubleshooting & Notes

- Ensure Firebase project configuration and OAuth client IDs are set correctly in Google Cloud Console.
- For mobile, test on real devices — OAuth flows behave differently on emulators.
- For web, ensure production OAuth redirect URIs are configured.
- If mobile sign-in fails to return access tokens, verify `useCredentialManager: false` is set.
- Auth cancellations are silently ignored — check `isAuthCancellation()` in `hooks/use-auth.ts`.

---

## References

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Google Drive API Reference](https://developers.google.com/drive)
- [Capacitor Firebase Auth](https://capawesome.io/plugins/firebase/authentication/)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

---

## Contact

For issues or questions, please open an issue in the repository or contact the maintainer.

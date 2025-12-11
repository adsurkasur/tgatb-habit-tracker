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

- The app uses OAuth access tokens to call the Google Drive REST API. The implementation expects an access token with Drive file scope (for example `https://www.googleapis.com/auth/drive.file`).
- Mobile uses Capacitor + Firebase authentication plugins to obtain tokens; see `mobile/` for platform specifics.
- Web uses platform-appropriate OAuth flows implemented in `web/drive-sync.ts` to obtain access tokens for upload/download.

### Backup / Restore Flow (current behavior)

- Export: `lib/habit-storage.ts` exports the full data bundle (habits, logs, metadata) validated by `shared/schema.ts`.
- Upload: `web/drive-sync.ts` / `mobile/drive-sync.ts` perform multipart uploads of the export bundle to Google Drive and return Drive file metadata.
- Download/Restore: Drive helpers list and download the latest backup file; `lib/validate-export-import.ts` validates the bundle before import.

### Important Caveats & Risks

- Current sync performs full-bundle push/pull. Importing a downloaded bundle may overwrite local data and can cause data loss when multiple devices change data concurrently.
- There is no per-item merge/conflict resolution implemented. `hooks/use-cloud-sync.ts` schedules pushes/pulls and retries, but does not implement item-level merging.
- There is no migration runner for versioned data schema. Importing older/newer formats can break the app without migrations.

### Recommendations

- Implement conflict-aware merge logic before enabling automatic background sync across multiple devices (per-item timestamps, version vectors, or operation logs / CRDTs).
- Add a migration runner (e.g., `lib/migrations/*`) and run migrations at startup with pre-migration backup.
- Provide an explicit user-facing restore confirmation and an easy manual export option before performing destructive imports.
- Gate analytics and tracking on explicit user consent; update `components/firebase-initializer.tsx` to respect consent state.

### Testing & Deployment notes

- Test Drive uploads/downloads on real devices for mobile flows (OAuth and native plugins behave differently on emulators).
- Configure OAuth client IDs and redirect URIs in Google Cloud Console and in your hosting platform for web flows.

### Suggested next steps

1. Review `hooks/use-cloud-sync.ts` and `web/drive-sync.ts` to design a merge strategy.
2. Add migration scaffolding in `lib/` and unit tests around `shared/schema.ts` validators.
3. Add clear UI for manual export/restore and confirm-before-import.

If you'd like, I can run a grep for `TODO|FIXME` across the repo, scaffold a migration runner, or draft a merge strategy proposal — tell me which you'd prefer.

# TGATB Habit Tracker: Google Auth + Drive Sync Integration Guide

## Overview

This guide covers the setup and usage of Google Authentication and Google Drive sync for both web (Next.js/Vercel) and mobile (Capacitor) platforms, using shared business logic for habit data export/import.

---

## Platform Structure

- `web/`: Web-specific Google Auth and Drive logic (Next.js, Vercel)
- `mobile/`: Mobile-specific Google Auth and Drive logic (Capacitor, Android/iOS)
- `shared/`: Shared business/data logic for export/import

---

### 1. Mobile Dependencies

```bash
npm install next-auth googleapis

### 2. Environment Variables
```env
NEXTAUTH_SECRET=your-nextauth-secret
### 1. Mobile Dependencies
```

### 3. NextAuth.js API Route

File: `web/pages/api/auth/[...nextauth].ts`

- Handles Google sign-in and provides access token for Drive API.
- Uses the recommended scope: `https://www.googleapis.com/auth/drive.file`

### 4. Drive API Route

File: `web/pages/api/drive.ts`

- POST: Uploads habit data to Drive as JSON.
- GET: Downloads habit data from Drive by file ID.
- Uses shared helpers for serialization/deserialization.

### 5. React UI

File: `web/pages/index.tsx`

- Sign in/out with Google.
- Export habits to Drive.
- Import habits from Drive.
- Displays status and imported data.

---

## Mobile Setup (Capacitor)

### 1. Dependencies

```bash
npm install @capacitor-firebase/authentication firebase
npx cap sync
```

### 2. Firebase Setup

- Enable Google provider in Firebase Console.
- Configure plugin in `capacitor.config.ts`.

### 3. Google Auth Logic

File: `mobile/google-auth.ts`

- Uses `@capacitor-firebase/authentication` to sign in and retrieve access token.

### 4. Drive Sync Logic

File: `mobile/drive-sync.ts`

- Uploads habit data to Drive using REST API and access token.
- Downloads habit data from Drive using REST API and access token.
- Uses shared helpers for serialization/deserialization.

### 5. Example Usage

File: `mobile/README.md`

```typescript
import { signInWithGoogle } from './google-auth';
const accessToken = await signInWithGoogle();

import { uploadHabitsToDrive, downloadHabitsFromDrive } from './drive-sync';
const fileId = await uploadHabitsToDrive(habits, accessToken);
const habits = await downloadHabitsFromDrive(fileId, accessToken);
```

---

## Shared Logic

File: `shared/data-sync.ts`

- `exportHabitsToJson(habits: any[]): string` — Serializes habit data to JSON.
- `importHabitsFromJson(json: string): any[]` — Deserializes habit data from JSON.

---

## Integration Flow

- Web and mobile platforms use shared helpers for habit data export/import.
- Web uses NextAuth.js and Google APIs; mobile uses Capacitor plugins and REST API.
- All flows are robust, error-handled, and ready for production.

---

## Troubleshooting & Notes

- Ensure all environment variables and Firebase/Google Cloud credentials are set correctly.
- For mobile, test on real devices for OAuth and Drive API flows.
- For web, deploy to Vercel and set production OAuth redirect URIs.
- Use the provided UI and API routes for all major flows.

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google Drive API Reference](https://developers.google.com/drive)
- [Capacitor Firebase Auth](https://capawesome.io/plugins/firebase/authentication/)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

---

## Contact

For issues or questions, please open an issue in the repository or contact the maintainer.


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

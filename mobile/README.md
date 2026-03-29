# Mobile (Capacitor) Integration

Mobile platform integration uses Firebase Google sign-in and Google Drive REST sync.

## Current Baseline

- Auth plugin: `@capacitor-firebase/authentication`
- Firebase JS SDK: `firebase`
- Drive sync: Google Drive REST API with OAuth access token
- Shared validation: `shared/schema.ts` plus import validation helpers

## Setup

1. Install dependencies.

```bash
npm install @capacitor-firebase/authentication firebase
npx cap sync android
```

2. Configure Firebase project and enable Google provider.
3. Ensure Capacitor Firebase Authentication is configured for mobile sign-in.
4. Keep mobile sign-in path configured to request Drive scope access token.

## Usage

### Sign In

```ts
import { signInWithGoogle } from "./google-auth";

const result = await signInWithGoogle();
const accessToken = result.accessToken;
```

### Export Habits

```ts
import { uploadHabitsToDrive } from "./drive-sync";

const fileId = await uploadHabitsToDrive(habits, accessToken);
```

### Import Habits

```ts
import { downloadHabitsFromDrive } from "./drive-sync";

const habits = await downloadHabitsFromDrive(fileId, accessToken);
```

## Notes

- Test on real devices for OAuth reliability.
- Keep `npx cap sync android` in the workflow after plugin/version changes.

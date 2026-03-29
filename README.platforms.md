# Platform Structure

- `web/`: Web-specific Google Auth and Drive logic (Next.js, Vercel)
- `mobile/`: Mobile-specific Google Auth and Drive logic (Capacitor, Android/iOS)
- `shared/`: Shared schemas/types for export/import validation and cross-platform safety

## Current Platform Model

- Local-first app behavior on both web and native.
- Optional Google sign-in enables cloud backup/sync via Google Drive.
- Pull flow uses migration + merge/conflict resolution instead of blind overwrite.
- Storage stays platform-aware: browser local storage on web and Capacitor preferences on native.

## Integration Flow

### Web

- Use Firebase Auth (`signInWithPopup`) for Google Auth (see `web/google-auth.ts`)
- Use Google Drive REST API for Drive sync (see `web/drive-sync.ts`)
- Use shared schema validation before import/persist (`shared/schema.ts`, `lib/validate-export-import.ts`)

### Mobile

- Use `@capacitor-firebase/authentication` with `useCredentialManager: false` for Google Auth (see `mobile/google-auth.ts`)
- Use Google Drive REST API for Drive sync (see `mobile/drive-sync.ts`)
- Use shared schema validation before import/persist (`shared/schema.ts`, `lib/validate-export-import.ts`)

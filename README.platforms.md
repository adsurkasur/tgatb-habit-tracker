# Platform Structure

- `web/`: Web-specific Google Auth and Drive logic (Next.js, Vercel)
- `mobile/`: Mobile-specific Google Auth and Drive logic (Capacitor, Android/iOS)
- `shared/`: Shared business/data logic for export/import

## Integration Flow

### Web

- Use Firebase Auth (`signInWithPopup`) for Google Auth (see `web/google-auth.ts`)
- Use Google Drive REST API for Drive sync (see `web/drive-sync.ts`)
- Use `shared/schema.ts` for data validation

### Mobile

- Use `@capacitor-firebase/authentication` with `useCredentialManager: false` for Google Auth (see `mobile/google-auth.ts`)
- Use Google Drive REST API for Drive sync (see `mobile/drive-sync.ts`)
- Use `shared/schema.ts` for data validation

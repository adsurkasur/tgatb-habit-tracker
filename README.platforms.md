# Platform Structure

- `web/`: Web-specific Google Auth and Drive logic (Next.js, Vercel)
- `mobile/`: Mobile-specific Google Auth and Drive logic (Capacitor, Android/iOS)
- `shared/`: Shared business/data logic for export/import

## Integration Flow

### Web

- Use NextAuth.js for Google Auth (see web/google-auth.ts)
- Use googleapis for Drive sync (see web/drive-sync.ts)
- Use shared/data-sync.ts for export/import helpers

### Mobile

- Use @capacitor-firebase/authentication for Google Auth (see mobile/google-auth.ts)
- Use REST API for Drive sync (see mobile/drive-sync.ts)
- Use shared/data-sync.ts for export/import helpers

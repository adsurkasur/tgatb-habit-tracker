// Google Auth logic for web (Next.js, Vercel)
// Uses NextAuth.js for Google authentication and Drive API access

// Usage:
// 1. Configure NextAuth.js in web/next-auth.config.ts
// 2. Add API routes for Drive operations (see web/drive-api.ts)
// 3. Use useSession() from next-auth/react in your components to access user and accessToken

// Example (React component):
// import { useSession, signIn, signOut } from "next-auth/react";
// const { data: session } = useSession();
// if (!session) signIn("google");
// session.accessToken can be used for Drive API calls

// For Drive sync, call your API route (see drive-api.ts) with the user's accessToken

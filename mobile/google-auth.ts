// Google Auth logic for mobile (Capacitor)
// Uses @capacitor-firebase/authentication for Google sign-in

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export async function signInWithGoogle(): Promise<string | null> {
	try {
		const result = await FirebaseAuthentication.signInWithGoogle({
			scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.file'],
		});
		// Return accessToken for Drive API usage
		return result.credential?.accessToken ?? null;
	} catch (err) {
		// Handle error (show toast, etc.)
		return null;
	}
}

// Usage:
// const accessToken = await signInWithGoogle();
// Use accessToken for Drive API requests

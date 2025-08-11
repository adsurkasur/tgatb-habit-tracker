// Google Auth logic for mobile (Capacitor)
// Uses @capacitor-firebase/authentication for Google sign-in

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export async function signInWithGoogle(): Promise<string | null> {
	try {
		console.debug('[GoogleAuth] signInWithGoogle called');
		const result = await FirebaseAuthentication.signInWithGoogle({
			scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.file'],
		});
		console.debug('[GoogleAuth] signInWithGoogle result:', result);
		if (result.credential?.accessToken) {
			console.debug('[GoogleAuth] Access token received:', result.credential.accessToken);
			return result.credential.accessToken;
		} else {
			console.error('[GoogleAuth] No access token in result:', result);
			return null;
		}
	} catch (err) {
		console.error('[GoogleAuth] signInWithGoogle error:', err);
		return null;
	}
}

// Usage:
// const accessToken = await signInWithGoogle();
// Use accessToken for Drive API requests

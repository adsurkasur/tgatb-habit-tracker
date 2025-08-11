// Google Auth logic for mobile (Capacitor)
// Uses @capacitor-firebase/authentication for Google sign-in

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export type GoogleAuthResult = {
	accessToken: string;
	name?: string;
	photoUrl?: string;
};

export async function signInWithGoogle(): Promise<GoogleAuthResult | null> {
	try {
		console.debug('[GoogleAuth] signInWithGoogle called');
		const result = await FirebaseAuthentication.signInWithGoogle({
			scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.file'],
		});
		console.debug('[GoogleAuth] signInWithGoogle result:', result);
			if (result.credential?.accessToken) {
				const name = result.user?.displayName || undefined;
				const photoUrl = result.user?.photoUrl || undefined;
				console.debug('[GoogleAuth] Access token received:', result.credential.accessToken);
				return {
					accessToken: result.credential.accessToken,
					name,
					photoUrl,
				};
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

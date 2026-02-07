// Google Auth logic for mobile (Capacitor)
// Uses @capacitor-firebase/authentication for Google sign-in

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export type GoogleAuthResult = {
	accessToken: string;
	name?: string;
	photoUrl?: string;
};

export async function signInWithGoogle(): Promise<GoogleAuthResult | null> {
	console.debug('[GoogleAuth] signInWithGoogle called');
	// Use legacy Google Sign-In flow (useCredentialManager: false) to ensure
	// access tokens are returned correctly for Drive API scopes.
	const result = await FirebaseAuthentication.signInWithGoogle({
		scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.file'],
		useCredentialManager: false,
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
		console.warn('[GoogleAuth] No access token in result; check Android OAuth client config (SHA fingerprints) and requested scopes', result);
		return null;
	}
}

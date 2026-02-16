// Google Auth logic for mobile (Capacitor)
// Uses @capacitor-firebase/authentication for Google sign-in

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export type GoogleAuthResult = {
	accessToken: string;
	uid?: string;
	name?: string;
	photoUrl?: string;
};

export async function signInWithGoogle(): Promise<GoogleAuthResult | null> {
	try {
		// Use legacy Google Sign-In flow (useCredentialManager: false) to ensure
		// access tokens are returned correctly for Drive API scopes.
		// Credential Manager does NOT support additional OAuth scopes like drive.file.
		const result = await FirebaseAuthentication.signInWithGoogle({
			scopes: ['https://www.googleapis.com/auth/drive.file'],
			useCredentialManager: false,
		});
		if (result.credential?.accessToken) {
			const uid = result.user?.uid || undefined;
			const name = result.user?.displayName || undefined;
			const photoUrl = result.user?.photoUrl || undefined;
			console.debug('[GoogleAuth] Access token received');
			return {
				accessToken: result.credential.accessToken,
				uid,
				name,
				photoUrl,
			};
		} else {
			console.warn('[GoogleAuth] No access token in result. Check OAuth config.');
			return null;
		}
	} catch (error: unknown) {
		// Surface the real native error for debugging
		const err = error as { message?: string; code?: string };
		console.error('[GoogleAuth] signInWithGoogle FAILED:', err.code ?? 'unknown');

		// Common native error codes:
		// 10 = DEVELOPER_ERROR (SHA-1 mismatch or missing Web Client ID)
		// 12500 = SIGN_IN_FAILED
		// 12501 = SIGN_IN_CANCELLED
		const msg = err.message || '';
		if (msg.includes('10') || msg.includes('DEVELOPER_ERROR')) {
			throw new Error(
				'Google Sign-In configuration error (DEVELOPER_ERROR). ' +
				'Verify: 1) SHA-1 fingerprint in Google Cloud Console matches APK signing key, ' +
				'2) google-services.json includes Web Client ID (client_type 3), ' +
				'3) Package name matches com.tgatb.habittracker'
			);
		}
		throw error;
	}
}

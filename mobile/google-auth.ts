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
	try {
		// Use legacy Google Sign-In flow (useCredentialManager: false) to ensure
		// access tokens are returned correctly for Drive API scopes.
		// Credential Manager does NOT support additional OAuth scopes like drive.file.
		const result = await FirebaseAuthentication.signInWithGoogle({
			scopes: ['https://www.googleapis.com/auth/drive.file'],
			useCredentialManager: false,
		});
		console.debug('[GoogleAuth] signInWithGoogle result:', JSON.stringify(result, null, 2));
		if (result.credential?.accessToken) {
			const name = result.user?.displayName || undefined;
			const photoUrl = result.user?.photoUrl || undefined;
			console.debug('[GoogleAuth] Access token received');
			return {
				accessToken: result.credential.accessToken,
				name,
				photoUrl,
			};
		} else {
			console.warn('[GoogleAuth] No access token in result. Possible causes:');
			console.warn('  1. SHA-1 fingerprint not registered in Google Cloud Console');
			console.warn('  2. Web Client ID missing from google-services.json');
			console.warn('  3. OAuth consent screen not configured for drive.file scope');
			console.warn('[GoogleAuth] Full result:', JSON.stringify(result, null, 2));
			return null;
		}
	} catch (error: unknown) {
		// Surface the real native error for debugging
		const err = error as { message?: string; code?: string };
		console.error('[GoogleAuth] signInWithGoogle FAILED:');
		console.error('  message:', err.message);
		console.error('  code:', err.code);
		console.error('  raw:', JSON.stringify(error));

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

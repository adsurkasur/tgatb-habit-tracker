import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { app } from "../components/firebase-initializer";

function isMobileBrowser(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export async function signInWithGoogleWeb(): Promise<string | null> {
	console.debug('[GoogleAuthWeb] signInWithGoogleWeb called');
	const auth = getAuth(app);
	const provider = new GoogleAuthProvider();
	provider.addScope("https://www.googleapis.com/auth/drive.file");
	provider.addScope("email");
	provider.addScope("profile");

	if (isMobileBrowser()) {
		// Mobile browsers have poor popup support — use redirect flow instead.
		// The result is handled on page reload via getGoogleRedirectResult().
		console.debug('[GoogleAuthWeb] Mobile browser detected, using signInWithRedirect');
		await signInWithRedirect(auth, provider);
		// Page navigates away — this line is never reached
		return null;
	}

	const result = await signInWithPopup(auth, provider);
	console.debug('[GoogleAuthWeb] signInWithGoogleWeb result:', result);
	// Try to get the OAuth access token for Drive API
	const credential = GoogleAuthProvider.credentialFromResult(result);
	const accessToken = credential?.accessToken || null;
	console.debug('[GoogleAuthWeb] Access token:', accessToken);
	return accessToken;
}

/**
 * Check for a pending Google redirect sign-in result.
 * Call once on app load to handle the return from signInWithRedirect.
 */
export async function getGoogleRedirectResult(): Promise<{
	accessToken: string | null;
	user: import("firebase/auth").User | null;
}> {
	try {
		const auth = getAuth(app);
		const result = await getRedirectResult(auth);
		if (result) {
			console.debug('[GoogleAuthWeb] Redirect result found:', result);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			return {
				accessToken: credential?.accessToken || null,
				user: result.user,
			};
		}
	} catch (error) {
		console.error('[GoogleAuthWeb] getRedirectResult error:', error);
	}
	return { accessToken: null, user: null };
}

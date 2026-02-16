import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../components/firebase-initializer";

/**
 * Sign in with Google using popup flow on ALL browsers (desktop + mobile).
 *
 * signInWithRedirect is intentionally NOT used because it depends on
 * cross-origin iframe storage access which is blocked by modern browsers
 * (Chrome 115+, Firefox 109+, Safari 16.1+, Samsung Internet) when
 * authDomain ≠ app hosting domain.
 *
 * signInWithPopup works reliably on all platforms including mobile browsers.
 */
export async function signInWithGoogleWeb(): Promise<string | null> {
	const auth = getAuth(app);
	const provider = new GoogleAuthProvider();
	provider.addScope("https://www.googleapis.com/auth/drive.file");
	provider.addScope("email");
	provider.addScope("profile");

	const result = await signInWithPopup(auth, provider);
	const credential = GoogleAuthProvider.credentialFromResult(result);
	const accessToken = credential?.accessToken || null;
	console.debug('[GoogleAuthWeb] Access token:', accessToken ? 'received' : 'null');
	return accessToken;
}

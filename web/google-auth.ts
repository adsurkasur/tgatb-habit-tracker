import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase";

export async function signInWithGoogleWeb(): Promise<string | null> {
		try {
			console.debug('[GoogleAuthWeb] signInWithGoogleWeb called');
			const auth = getAuth(app);
			const provider = new GoogleAuthProvider();
			provider.addScope("https://www.googleapis.com/auth/drive.file");
			provider.addScope("email");
			provider.addScope("profile");
			const result = await signInWithPopup(auth, provider);
			console.debug('[GoogleAuthWeb] signInWithGoogleWeb result:', result);
			// Try to get the OAuth access token for Drive API
			const credential = GoogleAuthProvider.credentialFromResult(result);
			const accessToken = credential?.accessToken || null;
			console.debug('[GoogleAuthWeb] Access token:', accessToken);
			return accessToken;
		} catch (err) {
			console.error('[GoogleAuthWeb] signInWithGoogleWeb error:', err);
			return null;
		}
}

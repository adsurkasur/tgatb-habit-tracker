import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../components/firebase-initializer";

export async function signInWithGoogleWeb(): Promise<string | null> {
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
}

import { useState, useEffect, useCallback } from "react";
import { Capacitor } from '@capacitor/core';
import { signInWithGoogle } from "@/mobile/google-auth";
import { app } from "../components/firebase-initializer";
import { useToast } from "@/hooks/use-toast";
import { TokenStorage } from '@/lib/utils';
import { getActiveAccountId, setActiveAccountId } from "@/lib/account-scope";

/** Detect if an auth error is a user-initiated cancellation (popup closed, back pressed, etc.) */
function isAuthCancellation(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = (err.message || '').toLowerCase();
  const code = (err as { code?: string }).code || '';
  // Web Firebase popup closed / duplicate popup
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return true;
  // Android Credential Manager cancellation
  if (msg.includes('cancel')) return true;
  // Android legacy Google Sign-In cancellation (status code 12501)
  if (msg.includes('12501')) return true;
  return false;
}

export interface AuthProfile {
  name?: string;
  photoUrl?: string;
}

export function useAuth() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [accountId, setAccountId] = useState<string>(getActiveAccountId());
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const isCapacitorApp = Capacitor.isNativePlatform();

  // Validate access token by making a lightweight Drive API call
  const validateAccessToken = async (accessToken: string): Promise<boolean> => {
    try {
      // Make a lightweight API call to check if token is valid
      const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1&fields=files(id)', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.warn('[useAuth] Token validation failed:', error);
      return false;
    }
  };

  // Clear login state and show toast for expired token
  const handleExpiredToken = useCallback(async () => {
    if (typeof window !== 'undefined' && !isCapacitorApp) {
      await TokenStorage.removeAccessToken();
      localStorage.removeItem('googleProfileName');
      localStorage.removeItem('googleProfilePhoto');
    } else if (isCapacitorApp) {
      await TokenStorage.removeAccessToken();
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'googleProfileName' });
      await Preferences.remove({ key: 'googleProfilePhoto' });
    }
    // Switch to anonymous namespace
    setActiveAccountId("anonymous");
    setAccountId("anonymous");
    setIsLoggedIn(false);
    setProfile(null);
    toast({
      title: "Logged Out Automatically",
      description: "Your login has expired. Please sign in again to access sync and cloud features.",
      variant: "destructive",
      duration: 5000,
    });
  }, [isCapacitorApp, toast]);

  // Load profile info on mount — check for stored token
  useEffect(() => {
    (async () => {
      let accessToken: string | null = null;
      let name: string | undefined = undefined;
      let photoUrl: string | undefined = undefined;

      if (typeof window !== 'undefined' && !isCapacitorApp) {
        accessToken = await TokenStorage.getAccessToken();
        name = localStorage.getItem('googleProfileName') || undefined;
        photoUrl = localStorage.getItem('googleProfilePhoto') || undefined;
      } else if (isCapacitorApp) {
        accessToken = await TokenStorage.getAccessToken();
        const { Preferences } = await import('@capacitor/preferences');
        name = (await Preferences.get({ key: 'googleProfileName' })).value || undefined;
        photoUrl = (await Preferences.get({ key: 'googleProfilePhoto' })).value || undefined;
      }

      if (accessToken) {
        // Validate the stored token
        const isValid = await validateAccessToken(accessToken);
        if (isValid) {
          // Ensure accountId is loaded from persisted value
          const currentId = getActiveAccountId();
          setAccountId(currentId);
          setIsLoggedIn(true);
          if (name || photoUrl) setProfile({ name, photoUrl });
        } else {
          // Token is expired, clear login state and show toast
          await handleExpiredToken();
        }
      } else {
        // Not logged in — use anonymous namespace
        setActiveAccountId("anonymous");
        setAccountId("anonymous");
        setIsLoggedIn(false);
      }

      setClientReady(true);
    })();
  }, [isCapacitorApp, toast, handleExpiredToken]);

  const handleAuth = async () => {
    try {
      if (!isLoggedIn) {
        // Login flow
        let accessToken: string | null = null;
        if (typeof window !== 'undefined' && !isCapacitorApp) {
          // Web platform
          const { signInWithGoogleWeb } = await import("../web/google-auth");
          const { getAuth } = await import("firebase/auth");
          accessToken = await signInWithGoogleWeb();
          if (accessToken) {
            await TokenStorage.setAccessToken(accessToken);
            // Get user profile info from Firebase Auth
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (user) {
              // Switch to this account's namespace
              const uid = user.uid;
              setActiveAccountId(uid);
              setAccountId(uid);
              localStorage.setItem('googleProfileName', user.displayName || '');
              localStorage.setItem('googleProfilePhoto', user.photoURL || '');
              setProfile({ name: user.displayName || '', photoUrl: user.photoURL || '' });
            }
            setIsLoggedIn(true);
            toast({
              title: "Sign-in Successful",
              description: "You are now signed in with Google.",
              duration: 3000,
            });
          } else {
            toast({
              title: "Sign-in Failed",
              description: "Could not sign in with Google.",
              variant: "destructive",
              duration: 3000,
            });
          }
        } else {
          // Mobile (Capacitor)
          const result = await signInWithGoogle();
          // result can be string (legacy) or object (new)
          let accessToken: string | null = null;
          let uid: string | undefined = undefined;
          let name: string | undefined = undefined;
          let photoUrl: string | undefined = undefined;
          if (typeof result === 'string') {
            accessToken = result;
          } else if (result && typeof result === 'object') {
            accessToken = result.accessToken || null;
            uid = result.uid || undefined;
            name = result.name || undefined;
            photoUrl = result.photoUrl || undefined;
          }
          if (accessToken) {
            await TokenStorage.setAccessToken(accessToken);
            // Switch to this account's namespace
            if (uid) {
              setActiveAccountId(uid);
              setAccountId(uid);
            }
            if (name) {
              const { Preferences } = await import('@capacitor/preferences');
              await Preferences.set({ key: 'googleProfileName', value: name });
            }
            if (photoUrl) {
              const { Preferences } = await import('@capacitor/preferences');
              await Preferences.set({ key: 'googleProfilePhoto', value: photoUrl });
            }
            setProfile({ name, photoUrl });
            setIsLoggedIn(true);
            toast({
              title: "Sign-in Successful",
              description: "You are now signed in with Google.",
              duration: 3000,
            });
          } else {
            toast({
              title: "Sign-in Failed",
              description: "Could not sign in with Google.",
              variant: "destructive",
              duration: 3000,
            });
          }
        }
      } else {
        // Logout flow
        if (typeof window !== 'undefined' && !isCapacitorApp) {
          await TokenStorage.removeAccessToken();
          // Clear cached Drive folder ID
          const { resetAppFolderCache } = await import('@/lib/drive-folder');
          resetAppFolderCache();
          localStorage.removeItem('googleProfileName');
          localStorage.removeItem('googleProfilePhoto');
          // Switch to anonymous namespace
          setActiveAccountId("anonymous");
          setAccountId("anonymous");
          setIsLoggedIn(false);
          setProfile(null);
          toast({
            title: "Logged Out",
            description: "You have been logged out of Google.",
            duration: 3000,
          });
        } else {
          await TokenStorage.removeAccessToken();
          // Clear cached Drive folder ID
          const { resetAppFolderCache } = await import('@/lib/drive-folder');
          resetAppFolderCache();
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.remove({ key: 'googleProfileName' });
          await Preferences.remove({ key: 'googleProfilePhoto' });
          // Switch to anonymous namespace
          setActiveAccountId("anonymous");
          setAccountId("anonymous");
          setIsLoggedIn(false);
          setProfile(null);
          toast({
            title: "Logged Out",
            description: "You have been logged out of Google.",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      // User cancelled sign-in (closed popup, pressed back, etc.) — not an error
      if (isAuthCancellation(err)) {
        console.debug('[useAuth] Sign-in cancelled by user');
        return;
      }
      if (err instanceof Error && err.message.includes('No credentials available')) {
        toast({
          title: "Sign-in Error",
          description: "No Google account found on this device. Please add an account and try again.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        toast({
          title: isLoggedIn ? "Logout Error" : "Sign-in Error",
          description: errorMsg || `An error occurred during ${isLoggedIn ? 'logout' : 'sign-in'}.`,
          variant: "destructive",
          duration: 5000,
        });
      }
      console.error(`[useAuth] ${isLoggedIn ? 'logout' : 'sign-in'} error`);
    }
  };

  return {
    isLoggedIn,
    accountId,
    profile,
    clientReady,
    handleAuth,
  };
}
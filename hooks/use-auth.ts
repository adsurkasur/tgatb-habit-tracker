import { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { signInWithGoogle } from "@/mobile/google-auth";
import { app } from "../components/firebase-initializer";
import { useToast } from "@/hooks/use-toast";

export interface AuthProfile {
  name?: string;
  photoUrl?: string;
}

export function useAuth() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const isCapacitorApp = Capacitor.isNativePlatform();

  // Load profile info on mount (web)
  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined' && !isCapacitorApp) {
        const accessToken = localStorage.getItem('googleAccessToken');
        setIsLoggedIn(!!accessToken);
        const name = localStorage.getItem('googleProfileName') || undefined;
        const photoUrl = localStorage.getItem('googleProfilePhoto') || undefined;
        if (name || photoUrl) setProfile({ name, photoUrl });
      } else if (isCapacitorApp) {
        const { Preferences } = await import('@capacitor/preferences');
        const accessToken = (await Preferences.get({ key: 'googleAccessToken' })).value;
        setIsLoggedIn(!!accessToken);
        const name = (await Preferences.get({ key: 'googleProfileName' })).value || undefined;
        const photoUrl = (await Preferences.get({ key: 'googleProfilePhoto' })).value || undefined;
        if (name || photoUrl) setProfile({ name, photoUrl });
      }
      setClientReady(true);
    })();
  }, [isCapacitorApp]);

  const handleAuth = async () => {
    try {
      if (!isLoggedIn) {
        // Login flow
        console.debug('[useAuth] Attempting sign-in...');
        let accessToken: string | null = null;
        if (typeof window !== 'undefined' && !isCapacitorApp) {
          // Web platform
          const { signInWithGoogleWeb } = await import("../web/google-auth");
          const { getAuth } = await import("firebase/auth");
          accessToken = await signInWithGoogleWeb();
          if (accessToken) {
            localStorage.setItem('googleAccessToken', accessToken);
            // Get user profile info from Firebase Auth
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (user) {
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
            console.error('[useAuth] No access token returned from sign-in');
          }
        } else {
          // Mobile (Capacitor)
          const result = await signInWithGoogle();
          // result can be string (legacy) or object (new)
          let accessToken: string | null = null;
          let name: string | undefined = undefined;
          let photoUrl: string | undefined = undefined;
          if (typeof result === 'string') {
            accessToken = result;
          } else if (result && typeof result === 'object') {
            accessToken = result.accessToken || null;
            name = result.name || undefined;
            photoUrl = result.photoUrl || undefined;
          }
          if (accessToken) {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({ key: 'googleAccessToken', value: accessToken });
            if (name) await Preferences.set({ key: 'googleProfileName', value: name });
            if (photoUrl) await Preferences.set({ key: 'googleProfilePhoto', value: photoUrl });
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
            console.error('[useAuth] No access token returned from sign-in');
          }
        }
      } else {
        // Logout flow
        if (typeof window !== 'undefined' && !isCapacitorApp) {
          localStorage.removeItem('googleAccessToken');
          localStorage.removeItem('googleProfileName');
          localStorage.removeItem('googleProfilePhoto');
          setIsLoggedIn(false);
          setProfile(null);
          toast({
            title: "Logged Out",
            description: "You have been logged out of Google.",
            duration: 3000,
          });
        } else {
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.remove({ key: 'googleAccessToken' });
          await Preferences.remove({ key: 'googleProfileName' });
          await Preferences.remove({ key: 'googleProfilePhoto' });
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
      if (err instanceof Error && err.message.includes('No credentials available')) {
        toast({
          title: "Sign-in Error",
          description: "No Google account found on this device. Please add an account and try again.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: isLoggedIn ? "Logout Error" : "Sign-in Error",
          description: `An error occurred during ${isLoggedIn ? 'logout' : 'sign-in'}.`,
          variant: "destructive",
          duration: 3000,
        });
      }
      console.error(`[useAuth] ${isLoggedIn ? 'logout' : 'sign-in'} threw error:`, err);
    }
  };

  return {
    isLoggedIn,
    profile,
    clientReady,
    handleAuth,
  };
}
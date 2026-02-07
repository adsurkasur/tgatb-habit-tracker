'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { HabitStorage } from '@/lib/habit-storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let analytics: Analytics | undefined;

// Always initialize Firebase Core (needed for Auth, etc.)
// Analytics is initialized separately only when user grants consent
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export function FirebaseInitializer({ children }: { children: ReactNode }) {
    const { isOnline } = useNetworkStatus();
    const [analyticsInitialized, setAnalyticsInitialized] = useState(false);

    useEffect(() => {
            if (isOnline && !analyticsInitialized) {
                // Initialize analytics only when user granted consent
                (async () => {
                    try {
                        const settings = await HabitStorage.getSettings();
                        if (!settings?.analyticsConsent) return;
                        if (typeof window !== 'undefined') {
                            analytics = getAnalytics(app);
                        }
                        setAnalyticsInitialized(true);
                    } catch (err) {
                        console.warn('Firebase Analytics initialization skipped:', err);
                    }
                })();
            }
    }, [isOnline, analyticsInitialized]);

    return <>{children}</>;
}

export { app, analytics };
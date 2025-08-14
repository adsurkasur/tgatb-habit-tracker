'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { useNetworkStatus } from '@/hooks/use-network-status';

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

export function FirebaseInitializer({ children }: { children: ReactNode }) {
    const { isOnline } = useNetworkStatus();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (isOnline && !initialized) {
            if (!getApps().length) {
                app = initializeApp(firebaseConfig);
                analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
            } else {
                app = getApp();
            }
            setInitialized(true);
        }
    }, [isOnline, initialized]);

    return <>{children}</>;
}

export { app, analytics };
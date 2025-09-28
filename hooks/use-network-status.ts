'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let networkListener: any = null;

    const setupNetworkDetection = async () => {
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Network plugin for native platforms
        try {
          const { Network } = await import('@capacitor/network');
          const status = await Network.getStatus();
          setIsOnline(status.connected);
          setIsInitialized(true);

          // Listen for network changes
          networkListener = Network.addListener('networkStatusChange', (status) => {
            setIsOnline(status.connected);
            if (!status.connected) {
              setWasOffline(true);
            } else {
              setWasOffline(false);
            }
          });
        } catch (error) {
          console.warn('Failed to load Capacitor Network plugin, falling back to browser API', error);
          // Fallback to browser API
          setupBrowserNetworkDetection();
        }
      } else {
        // Use browser API for web
        setupBrowserNetworkDetection();
      }
    };

    const setupBrowserNetworkDetection = () => {
      // More robust initial state detection
      const checkOnlineStatus = async () => {
        let online = navigator.onLine;

        // Additional check: try to fetch a small resource to verify connectivity
        if (online) {
          try {
            // Try to fetch the current page or a small resource with no-cache
            const response = await fetch(window.location.href, {
              method: 'HEAD',
              cache: 'no-cache',
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            online = response.ok;
          } catch (error) {
            // If fetch fails, we're likely offline
            online = false;
          }
        }

        setIsOnline(online);
        setIsInitialized(true);
      };

      // Initial check with a small delay to allow page to settle
      const timeoutId = setTimeout(checkOnlineStatus, 100);

      const handleOnline = () => {
        setIsOnline(true);
        setWasOffline(false);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setWasOffline(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    };

    const cleanup = setupNetworkDetection();

    return () => {
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, []);

  return { isOnline, wasOffline, isInitialized };
}

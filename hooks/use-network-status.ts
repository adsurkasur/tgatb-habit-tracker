'use client';

import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
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
  }, []);

  return { isOnline, wasOffline, isInitialized };
}

"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registration successful:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('[SW] Update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New content available, please refresh');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Message received:', event.data);
      });

      // Check if service worker is controlling the page
      if (navigator.serviceWorker.controller) {
        console.log('[SW] Page is controlled by service worker');
      } else {
        console.log('[SW] Page is not controlled by service worker');
      }
    } else {
      console.log('[SW] Service workers not supported');
    }
  }, []);

  return null; // This component doesn't render anything
}

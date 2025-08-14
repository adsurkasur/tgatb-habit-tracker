"use client";

import { useEffect } from "react";

type WorkboxLike = {
  addEventListener: (event: string, cb: (...args: unknown[]) => void) => void;
  register: () => void;
  messageSkipWaiting: () => void;
};

declare global {
  interface Window {
    workbox?: WorkboxLike;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      // Try Workbox registration first
      if (window.workbox) {
        console.log('[SW] Workbox detected, registering via Workbox...');
        registerServiceWorkerWorkbox(window.workbox);
      } else {
        // Fallback: register /sw.js directly
        console.log('[SW] Workbox not detected, registering /sw.js directly...');
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            console.log('[SW] Registration successful:', reg);
            reg.addEventListener('updatefound', () => {
              console.log('[SW] Update found');
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[SW] New content available, please refresh');
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('[SW] Registration failed:', error);
          });
      }
    } else {
      console.log('[SW] Service workers not supported');
    }
  }, []);

  return null;
}

function registerServiceWorkerWorkbox(wb: WorkboxLike): void {
  const promptNewVersionAvailable = () => {
    const shouldUpdate = confirm("A newer version of this web app is available, reload to update?");
    if (shouldUpdate) {
      handleServiceWorkerUpdate(wb);
    }
  };
  wb.addEventListener('waiting', promptNewVersionAvailable);
  wb.addEventListener('externalwaiting', promptNewVersionAvailable);
  wb.register();
}

function handleServiceWorkerUpdate(workbox: WorkboxLike): void {
  workbox.addEventListener('controlling', () => {
    window.location.reload();
  });
  workbox.messageSkipWaiting();
}

export default ServiceWorkerRegistration;

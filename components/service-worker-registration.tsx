"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    workbox?: any;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasWorkbox = window.workbox !== undefined;

    if (isClient && hasServiceWorker && hasWorkbox) {
      const wb = window.workbox;
      
      // Register service worker
      const promptNewVersionAvailable = () => {
        // Show a confirmation dialog (or notification bar)
        const shouldUpdate = confirm("A newer version of this web app is available, reload to update?");
        if (shouldUpdate) {
          wb.addEventListener('controlling', () => {
            window.location.reload();
          });
          
          // Send a message to the waiting service worker to skip waiting
          wb.messageSkipWaiting();
        }
      };
      
      wb.addEventListener('waiting', promptNewVersionAvailable);
      wb.addEventListener('externalwaiting', promptNewVersionAvailable);

      // Register the service worker
      wb.register();
    }
  }, []);

  return null;
}

export default ServiceWorkerRegistration;

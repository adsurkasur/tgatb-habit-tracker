// Optional Secure Storage adapter
// Tries to use a Capacitor secure storage plugin when available; falls back to PlatformStorage.
export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        try {
          const plugin = await import('@capacitor/secure-storage');
          if (plugin && typeof plugin.get === 'function') {
            const res = await plugin.get({ key });
            return (res && (res as any).value) ?? null;
          }
        } catch {
          // plugin not available, fall through to PlatformStorage
        }
      }
    } catch (e) { console.debug('[SecureStorage] plugin path error', e); }

    // Fallback to platform storage
    try {
      try {
        const { PlatformStorage } = await import('./platform-storage');
        console.debug('[SecureStorage] falling back to PlatformStorage.getItem', key);
        return await PlatformStorage.getItem(key);
      } catch {
        const { PlatformStorage } = await import('./platform-storage.ts');
        console.debug('[SecureStorage] falling back to PlatformStorage.getItem (ts)', key);
        return await PlatformStorage.getItem(key);
      }
    } catch (err) { console.debug('[SecureStorage] fallback getItem error', err); return null; }
  },


  async setItem(key: string, value: string): Promise<void> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        try {
          const plugin = await import('@capacitor/secure-storage');
          if (plugin && typeof plugin.set === 'function') {
            await plugin.set({ key, value });
            return;
          }
        } catch {
          // plugin not available, fall through
        }
      }
    } catch (e) { console.debug('[SecureStorage] plugin path/set error', e); }

    try {
      try {
        const { PlatformStorage } = await import('./platform-storage');
        console.debug('[SecureStorage] falling back to PlatformStorage.setItem', key);
        await PlatformStorage.setItem(key, value);
      } catch {
        const { PlatformStorage } = await import('./platform-storage.ts');
        console.debug('[SecureStorage] falling back to PlatformStorage.setItem (ts)', key);
        await PlatformStorage.setItem(key, value);
      }
    } catch (err) { console.debug('[SecureStorage] fallback setItem error', err); }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        try {
          const plugin = await import('@capacitor/secure-storage');
          if (plugin && typeof plugin.remove === 'function') {
            await plugin.remove({ key });
            return;
          }
        } catch {
          // plugin not available, fall through
        }
      }
    } catch (e) { console.debug('[SecureStorage] plugin path/remove error', e); }

    try {
      try {
        const { PlatformStorage } = await import('./platform-storage');
        console.debug('[SecureStorage] falling back to PlatformStorage.removeItem', key);
        await PlatformStorage.removeItem(key);
      } catch {
        const { PlatformStorage } = await import('./platform-storage.ts');
        console.debug('[SecureStorage] falling back to PlatformStorage.removeItem (ts)', key);
        await PlatformStorage.removeItem(key);
      }
    } catch (err) { console.debug('[SecureStorage] fallback removeItem error', err); }
  }
};
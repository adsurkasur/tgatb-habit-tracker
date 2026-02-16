// Optional Secure Storage adapter
// Tries to use a Capacitor secure storage plugin when available; falls back to PlatformStorage.

// Typed interface for the optional Capacitor secure storage plugin
type SecureStoragePlugin = {
  get?: (args: { key: string }) => Promise<{ value?: string } | undefined>;
  set?: (args: { key: string; value: string }) => Promise<void>;
  remove?: (args: { key: string }) => Promise<void>;
};

export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        try {
          const pkg = '@capacitor/secure-storage';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const plugin = await import(/* webpackIgnore: true */ pkg) as unknown as SecureStoragePlugin;
          if (plugin && typeof plugin.get === 'function') {
            const res = await plugin.get({ key }) as { value?: string } | undefined;
            return (res && res.value) ?? null;
          }
        } catch {
          // plugin not available, fall through to PlatformStorage
        }
      }
    } catch (e) { /* plugin path error - silent */ }

    // Fallback to platform storage
    try {
      try {
        const { PlatformStorage } = await import('./platform-storage');
        return await PlatformStorage.getItem(key);
      } catch {
        try {
          const alt = './platform-storage.ts';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { PlatformStorage } = await import(/* webpackIgnore: true */ alt);
          return await PlatformStorage.getItem(key);
        } catch {
          // final fallback
        }
      }
    } catch { return null; }

    // Ensure we always return a value in all code paths
    return null;
  },


  async setItem(key: string, value: string): Promise<void> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        try {
          const pkg = '@capacitor/secure-storage';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const plugin = await import(/* webpackIgnore: true */ pkg) as unknown as SecureStoragePlugin;
          if (plugin && typeof plugin.set === 'function') {
            await plugin.set({ key, value });
            return;
          }
        } catch {
          // plugin not available, fall through
        }
      }
    } catch (e) { /* plugin path/set error - silent */ }

    try {
      try {
        const { PlatformStorage } = await import('./platform-storage');
        await PlatformStorage.setItem(key, value);
      } catch {
        try {
          const alt = './platform-storage.ts';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { PlatformStorage } = await import(/* webpackIgnore: true */ alt);
          await PlatformStorage.setItem(key, value);
        } catch {
          // final fallback
        }
      }
    } catch { /* fallback setItem error - silent */ }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        try {
          const pkg = '@capacitor/secure-storage';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const plugin = await import(/* webpackIgnore: true */ pkg) as unknown as SecureStoragePlugin;
          if (plugin && typeof plugin.remove === 'function') {
            await plugin.remove({ key });
            return;
          }
        } catch {
          // plugin not available, fall through
        }
      }
    } catch (e) { /* plugin path/remove error - silent */ }

    try {
      try {
        const { PlatformStorage } = await import('./platform-storage');
        await PlatformStorage.removeItem(key);
      } catch {
        try {
          const alt = './platform-storage.ts';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { PlatformStorage } = await import(/* webpackIgnore: true */ alt);
          await PlatformStorage.removeItem(key);
        } catch {
          // final fallback
        }
      }
    } catch { /* fallback removeItem error - silent */ }
  }
};
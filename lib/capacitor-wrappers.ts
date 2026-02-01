// Lightweight wrappers around Capacitor plugins with graceful fallbacks
export const NetworkWrapper = {
  async getStatus(): Promise<{ connected: boolean; }>{
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { Network } = await import('@capacitor/network');
        const s = await Network.getStatus();
        return { connected: !!s.connected };
      }
    } catch {
      // ignore and fall through to web
    }
    // Fallback: use navigator.onLine
    return { connected: typeof navigator !== 'undefined' ? navigator.onLine : true };
  },
  async addListener(eventName: 'networkStatusChange', callback: (status: { connected: boolean }) => void): Promise<{ remove: () => void } | null> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { Network } = await import('@capacitor/network');
        const listener = await Network.addListener(eventName, (status) => callback({ connected: !!status.connected }));
        return listener as { remove: () => void };
      }
    } catch {
      // ignore
    }

    // Web fallback: use window events
    const handler = () => callback({ connected: navigator.onLine });
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return {
      remove: () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      }
    };
  }
};

export const StatusBarWrapper = {
  async setStyle(style: 'DARK' | 'LIGHT') {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) return;
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: style === 'DARK' ? Style.Dark : Style.Light });
    } catch { /* ignore */ }
  },
  async hide() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) return;
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch { /* ignore */ }
  },
  async show() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) return;
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.show();
    } catch { /* ignore */ }
  }
};
// 'use client';  // Not necessary unless imported in a Server Component context.
// Deprecated hook kept as a tiny compatibility shim. Prefer useSystemBarsUnified.
import { useSystemBarsUnified } from './use-system-bars-unified';

export const useEnhancedFullscreen = (isFullscreenEnabled: boolean) => {
  const { applySystemBars } = useSystemBarsUnified(isFullscreenEnabled);
  return { applyFullscreenSettings: () => applySystemBars(isFullscreenEnabled) };
};

export default useEnhancedFullscreen;

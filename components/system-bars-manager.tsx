'use client';

// DEPRECATED: This component has been replaced by useSystemBarsUnified() hook
// 
// This file is kept for backward compatibility but is no longer used.
// The unified system bar management is now handled by:
// - hooks/use-system-bars-unified.ts
// - SystemUiPlugin.java (native Android)
//
// See docs/SYSTEM_BARS_FIX.md for migration details.

interface Props { fullscreen: boolean; }

/**
 * @deprecated Use useSystemBarsUnified() hook instead
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SystemBarsManager({ fullscreen }: Props) {
  console.warn('SystemBarsManager is deprecated. Use useSystemBarsUnified() hook instead.');
  return null;
}

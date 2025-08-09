'use client';

// Native Android immersive handled by SystemUiPlugin. This component now only:
// - Styles iOS status bar
// - Reinforces visible status bar styling right after exiting fullscreen (Android fallback if plugin absent)

import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyles } from '@capacitor/status-bar';

interface Props { fullscreen: boolean; }

const PURPLE = '#6750a4';
const APPLY_DEBOUNCE_MS = 350;

export function SystemBarsManager({ fullscreen }: Props) {
  const lastApplyRef = useRef<number>(0);
  const isAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const isIOS = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const applyVisible = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      if (isAndroid()) {
        if (fullscreen) return; // plugin hides
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: PURPLE });
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
        await StatusBar.show();
      } else if (isIOS()) {
        await StatusBar.show();
        await StatusBar.setStyle({ style: StatusBarStyles.Light });
      }
    } catch {}
  }, [fullscreen]);

  const applyFullscreen = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (isAndroid()) return; // native
    try { await StatusBar.hide(); } catch {}
  }, []);

  const debounced = useCallback((fn: () => void) => {
    const now = Date.now();
    if (now - lastApplyRef.current < APPLY_DEBOUNCE_MS) return;
    lastApplyRef.current = now;
    fn();
  }, []);

  useEffect(() => {
    if (fullscreen) debounced(() => applyFullscreen()); else debounced(() => applyVisible());
  }, [fullscreen, applyFullscreen, applyVisible, debounced]);

  useEffect(() => { if (!fullscreen) applyVisible(); }, [fullscreen, applyVisible]);
  return null;
}

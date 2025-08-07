'use client';

import { useStatusBar } from '@/hooks/use-status-bar';
import { useEffect } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeAreaWrapper = ({ children, className = '' }: SafeAreaWrapperProps) => {
  const { visible, height, overlays, isNative } = useStatusBar();

  useEffect(() => {
    if (isNative) {
      // Apply safe area insets as CSS custom properties
      const root = document.documentElement;
      
      // For status bar
      root.style.setProperty('--status-bar-height', `${height}px`);
      root.style.setProperty('--safe-area-top', overlays ? `${height}px` : '0px');
      
      // For navigation bar (Android) - estimate
      const navBarHeight = 48; // Common Android nav bar height
      root.style.setProperty('--safe-area-bottom', `${navBarHeight}px`);
      
      // Apply to body to prevent content from going under status bar
      document.body.style.paddingTop = overlays ? `${height}px` : '0px';
    }
  }, [visible, height, overlays, isNative]);

  if (!isNative) {
    // For web, use CSS env() variables
    return (
      <div 
        className={`min-h-screen ${className}`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {children}
      </div>
    );
  }

  // For native platforms
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        paddingTop: overlays ? `${height}px` : '0px',
        paddingBottom: '48px' // For Android navigation bar
      }}
    >
      {children}
    </div>
  );
};

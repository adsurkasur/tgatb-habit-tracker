'use client';

import { useStatusBar } from '@/hooks/use-status-bar';
import { useEffect } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeAreaWrapper = ({ children, className = '' }: SafeAreaWrapperProps) => {
  const { visible, height, overlays, isNative } = useStatusBar();

  // Remove all top padding/margin/background for native platforms
  useEffect(() => {
    if (isNative) {
      const root = document.documentElement;
      root.style.setProperty('--status-bar-height', '0px');
      root.style.setProperty('--safe-area-top', '0px');
      document.body.style.paddingTop = '0px';
    }
  }, [isNative]);

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

  // For native platforms, do not render any top padding or reserved area
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        paddingTop: '0px',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {children}
    </div>
  );
};

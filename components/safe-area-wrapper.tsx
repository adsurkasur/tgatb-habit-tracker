'use client';

import { useStatusBar } from '@/hooks/use-status-bar';
import { useEffect } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeAreaWrapper = ({ children, className = '' }: SafeAreaWrapperProps) => {
  const { isNative } = useStatusBar();

  // No manual status bar padding or background. Rely on native status bar and safe area insets only.

  return (
    <div className={`min-h-screen ${className}`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}>
      {children}
    </div>
  );
};

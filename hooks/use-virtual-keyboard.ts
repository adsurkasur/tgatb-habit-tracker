import { useEffect, useState } from 'react';

interface VirtualKeyboardState {
  isKeyboardOpen: boolean;
  viewportHeight: number;
  keyboardHeight: number;
}

/**
 * Custom hook to detect virtual keyboard state on mobile devices
 * Uses the Visual Viewport API when available, falls back to viewport height detection
 */
export function useVirtualKeyboard(): VirtualKeyboardState {
  const [state, setState] = useState<VirtualKeyboardState>({
    isKeyboardOpen: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    keyboardHeight: 0,
  });

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return;

    let isSupported = false;
    let initialHeight = window.innerHeight;

    // Check if Visual Viewport API is supported (modern approach)
    if ('visualViewport' in window && window.visualViewport) {
      isSupported = true;
      initialHeight = window.visualViewport.height;

      const handleViewportChange = () => {
        if (!window.visualViewport) return;

        const currentHeight = window.visualViewport.height;
        const heightDifference = initialHeight - currentHeight;
        
        // Consider keyboard open if viewport height reduced by more than 150px
        // This threshold helps avoid false positives from address bar hiding
        const isKeyboardOpen = heightDifference > 150;

        setState({
          isKeyboardOpen,
          viewportHeight: currentHeight,
          keyboardHeight: isKeyboardOpen ? heightDifference : 0,
        });
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      // Set initial state
      handleViewportChange();

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleViewportChange);
        }
      };
    }

    // Fallback for older browsers using window resize
    if (!isSupported) {
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialHeight - currentHeight;
        const isKeyboardOpen = heightDifference > 150;

        setState({
          isKeyboardOpen,
          viewportHeight: currentHeight,
          keyboardHeight: isKeyboardOpen ? heightDifference : 0,
        });
      };

      window.addEventListener('resize', handleResize);
      
      // Set initial state
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return state;
}

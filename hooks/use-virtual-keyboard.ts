import { useState, useEffect } from 'react';

interface UseVirtualKeyboardReturn {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  viewportHeight: number;
}

/**
 * Hook to detect when the virtual keyboard is open on mobile devices
 * and provide information about the keyboard state
 */
export function useVirtualKeyboard(): UseVirtualKeyboardReturn {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    const initialWindowHeight = window.innerHeight;
    setViewportHeight(initialViewportHeight);

    const handleViewportChange = () => {
      const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
      const currentWindowHeight = window.innerHeight;
      
      // Calculate the difference to determine if keyboard is open
      const heightDifference = initialWindowHeight - currentViewportHeight;
      const isOpen = heightDifference > 150; // Threshold for keyboard detection
      
      setIsKeyboardOpen(isOpen);
      setKeyboardHeight(isOpen ? heightDifference : 0);
      setViewportHeight(currentViewportHeight);
    };

    // Listen for viewport changes (modern approach)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    // Fallback for older browsers
    window.addEventListener('resize', handleViewportChange);

    // Initial check
    handleViewportChange();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  return {
    isKeyboardOpen,
    keyboardHeight,
    viewportHeight
  };
}

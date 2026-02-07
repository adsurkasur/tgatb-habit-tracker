import { useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';

interface UseNavigationManagerOptions {
  onBackPressed?: () => void;
  isActive?: boolean; // Only handle back when this is true
}

/**
 * Hook to manage mobile back navigation behavior.
 * On mobile devices, this prevents the browser back button from closing the app
 * and instead calls the provided callback to close modals/dialogs.
 */
export function useMobileBackNavigation({ onBackPressed, isActive = true }: UseNavigationManagerOptions = {}) {
  const isMobile = useIsMobile();
  const isHandlingBack = useRef(false);

  useEffect(() => {
    if (!isMobile || !isActive) return;

    const handlePopState = (event: PopStateEvent) => {
      // Prevent the default back navigation
      if (onBackPressed && !isHandlingBack.current) {
        isHandlingBack.current = true;
        event.preventDefault();
        
        // Call the callback to handle the back action (e.g., close modal)
        onBackPressed();
        
        // Push a new state to maintain the current URL
        // This prevents the browser from actually navigating back
        window.history.pushState(null, '', window.location.href);
        
        setTimeout(() => {
          isHandlingBack.current = false;
        }, 100);
      }
    };

    // Add an initial state to the history stack
    // This ensures we have something to "go back" to
    window.history.pushState(null, '', window.location.href);
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobile, onBackPressed, isActive]);
}

interface ModalState {
  isOpen: boolean;
  onClose: () => void;
  priority?: number; // Higher priority modals are closed first
}

/**
 * Enhanced hook that manages multiple modals/dialogs and their back navigation behavior.
 * This allows you to register multiple modals and automatically handles closing them
 * in the correct order when the back button is pressed.
 */
export function useMobileModalManager() {
  const isMobile = useIsMobile();
  const modalsRef = useRef<Map<string, ModalState>>(new Map());

  // Register a modal with the manager
  const registerModal = (id: string, modalState: ModalState) => {
    if (modalState.isOpen) {
      modalsRef.current.set(id, modalState);
    } else {
      modalsRef.current.delete(id);
    }
  };

  // Get the modal that should be closed (highest priority, then most recently opened)
  const getModalToClose = (): ModalState | null => {
    const modals = Array.from(modalsRef.current.values()).filter(modal => modal.isOpen);
    if (modals.length === 0) return null;

    // Sort by priority (descending) then by insertion order (most recent first)
    return modals.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  };

  const handleBackPressed = () => {
    const modalToClose = getModalToClose();
    if (modalToClose) {
      modalToClose.onClose();
      return true; // Handled
    }
    return false; // Not handled
  };

  // Set up the back navigation handling
  useMobileBackNavigation({ 
    onBackPressed: () => {
      handleBackPressed();
    }
  });

  return {
    registerModal,
    hasOpenModals: () => Array.from(modalsRef.current.values()).some(modal => modal.isOpen),
  isMobile,
  closeTopModal: handleBackPressed
  };
}

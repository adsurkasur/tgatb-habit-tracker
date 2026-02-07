import '@testing-library/jest-dom';

// Mock window.matchMedia for jsdom (used by useIsMobile / ResponsiveDialog)
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Provide a minimal localStorage mock for Node environments if needed
if (typeof window !== 'undefined' && !window.localStorage) {
  // no-op
}

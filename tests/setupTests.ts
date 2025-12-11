import '@testing-library/jest-dom';

// Provide a minimal localStorage mock for Node environments if needed
if (typeof window !== 'undefined' && !window.localStorage) {
  // no-op
}

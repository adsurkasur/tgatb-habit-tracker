import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: false,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  serverExternalPackages: [],
};

// PWA Configuration - BEST PRACTICE: Use Workbox with custom worker
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Use InjectManifest with custom worker for additional functionality
  swSrc: 'worker/index.js', // This tells next-pwa to use our custom worker
  // Workbox will handle all the heavy lifting + our custom code
  
  // Fallbacks for offline experience
  fallbacks: {
    document: '/_offline', // Create pages/_offline.js
  }
});

export default pwaConfig(nextConfig);

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
  
  // Configure manifest generation to exclude problematic files
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /middleware\.js$/,
    /_middleware\.js$/,
  ],
  
  // Additional configuration for handling 404s gracefully
  additionalManifestEntries: [],
  
  // Fallbacks for offline experience
  fallbacks: {
    document: '/offline', // Updated to use correct route
  }
});

export default pwaConfig(nextConfig);

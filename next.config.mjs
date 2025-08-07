import withPWA from 'next-pwa';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read package.json to get version
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static export
  trailingSlash: true, // Required for static export
  assetPrefix: '.', // Use relative paths for static assets
  basePath: '', // No base path
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: packageJson.version,
  },
  serverExternalPackages: [],
  // Exclude API routes from static export
  generateBuildId: async () => {
    return 'capacitor-build'
  },
};

// PWA Configuration - BEST PRACTICE: Use Workbox with custom worker
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: true, // Disable PWA for Android build
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

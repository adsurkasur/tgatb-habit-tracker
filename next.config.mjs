import withPWA from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { networkInterfaces } from 'os';

// Read package.json to get version
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

function getAllowedDevOrigins() {
  const fromEnv = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const interfaces = networkInterfaces();
  const lanAddresses = Object.values(interfaces)
    .flat()
    .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address);

  const ports = ['3000', '3001'];
  const lanOrigins = lanAddresses.flatMap((ip) =>
    ports.map((port) => `http://${ip}:${port}`)
  );

  return [...new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    ...lanOrigins,
    ...fromEnv,
  ])];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
  turbopack: {}, // Add empty turbopack config so Next.js won't error when a custom webpack config exists
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static export
  trailingSlash: true, // Required for static export
  basePath: '', // No base path
  assetPrefix: '',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: packageJson.version,
  },
  allowedDevOrigins: getAllowedDevOrigins(),
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
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev to avoid InjectManifest warnings
  // NOTE: To test PWA features in development, temporarily change to: disable: false
  // Then run: npm run dev
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

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(pwaConfig(nextConfig));

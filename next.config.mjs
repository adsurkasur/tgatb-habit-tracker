/** @type {import('next').NextConfig} */
const nextConfig = {
  // Path aliases configuration - these will be defined in tsconfig.json
  // but we can also define them here if needed for webpack
  webpack: (config) => {
    // Add any custom webpack configuration here if needed
    return config;
  },
  // Optimize for Vercel deployment
  reactStrictMode: true,
  // Optimize images
  images: {
    domains: [], // Add any external image domains here
    unoptimized: false, // Keep image optimization enabled
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Updated configuration for Next.js 15
  serverExternalPackages: [],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable experimental features if needed
  },
  // Path aliases configuration - these will be defined in tsconfig.json
  // but we can also define them here if needed for webpack
  webpack: (config) => {
    // Add any custom webpack configuration here if needed
    return config;
  },
  // For Vercel deployment
  output: 'standalone',
  // Disable strict mode to be compatible with some components
  reactStrictMode: true,
  // Optimize images
  images: {
    domains: [], // Add any external image domains here
  },
};

export default nextConfig;

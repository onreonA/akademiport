import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: process.cwd(),
  },
  // Reduce file watching to prevent EMFILE errors on macOS
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }

    // Make web-push optional (it's only used in push notification service)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'web-push': false,
    };

    return config;
  },
  // Exclude web-push from server-side bundle analysis
  serverExternalPackages: ['web-push'],
  // Skip build-time static generation for API routes to avoid EBADF errors
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

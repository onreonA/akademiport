/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration - GEÇICI OLARAK KAPALI
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };

    // Development mode - simpler configuration
    if (dev) {
      // Disable aggressive chunk splitting in development
      config.optimization.splitChunks = {
        chunks: 'async',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    } else {
      // Production optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  // Compression
  compress: true,

  // Experimental features
  experimental: {
    // Remove deprecated instrumentationHook
    // instrumentationHook: true,

    // Enable modern bundling
    esmExternals: true,

    // Optimize CSS
    optimizeCss: true,
  },

  // Output configuration
  output: 'standalone',

  // Performance optimizations
  poweredByHeader: false,

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

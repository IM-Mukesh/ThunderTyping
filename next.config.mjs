/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // If you're on Vercel, enabling Next.js image optimization helps LCP.
  // If you must keep unoptimized images, set unoptimized: true.
  images: {
    unoptimized: false,
  },

  reactStrictMode: true,

  // Enable CSS optimization (safe and helpful)
  experimental: {
    optimizeCss: true,
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // modularize imports for common heavy libs to reduce bundle size
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/icons/{{member}}",
    },
    lodash: {
      transform: "lodash/{{member}}",
    },
  },

  // Webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting on client
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Headers for better caching & security and ensure .xml is served with application/xml
  async headers() {
    return [
      {
        // long cache for static asset file types
        source: "/:all*(jpg|jpeg|png|gif|svg|webp|avif|ico|woff2|woff|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // ensure XML files served with correct content-type
        source: "/:all(.xml)",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
      {
        // security headers for all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

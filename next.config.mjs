/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // set to false for safety in production; you can enable locally for fast dev iteration
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: false,
  },

  reactStrictMode: true,

  experimental: {
    optimizeCss: true,
    // appDir: true, // enable if you're using the /app router
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/icons/{{member}}",
    },
    lodash: {
      transform: "lodash/{{member}}",
    },
  },

  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },

  // NOTE: removed top-level `swcMinify` due to Next version compatibility.
  // If your Next supports it, you can re-add it after checking `next -v`.

  // Corrected header sources (Next's route matcher syntax)
  async headers() {
    return [
      {
        // long cache for image / font asset extensions
        // use a simple group without `?:` so Next's parser accepts it
        source: "/:all*\\.(jpg|jpeg|png|gif|svg|webp|avif|ico|woff2|woff|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // match any .xml path
        source: "/:all*\\.xml",
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
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

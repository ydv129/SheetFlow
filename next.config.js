/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode to catch potential bugs during development
  reactStrictMode: true,

  // Build a production-ready standalone output for deployment
  output: "standalone",

  // Compression and dynamic protocol optimization
  compress: true,

  // PoweredBy header removal for security
  poweredByHeader: false,

  // Generate ETags for cache validation
  generateEtags: true,

  // Image optimization for responsive images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
    // Responsive image sizes for different screens
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_APP_TITLE: "SheetFlow AI",
  },

  // Headers for performance, security, and dynamic protocols
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Security Headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Performance & Caching Headers
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' static.cloudflareinsights.com; connect-src 'self' huggingface.co *.huggingface.co hf.co *.hf.co raw.githubusercontent.com *.githubusercontent.com *.amazonaws.com; img-src 'self' data: *.googleusercontent.com; font-src 'self' fonts.googleapis.com fonts.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; worker-src 'self' blob:;",
          },
        ],
      },
      // Static assets - long cache
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Images - moderate cache with revalidation
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
      // API routes - no cache (or short cache)
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
      // HTML pages - short cache with revalidation
      {
        source: "/:path*.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirect to enforce HTTPS in production
  async redirects() {
    return [];
  },

  // Rewrites for API routing
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;

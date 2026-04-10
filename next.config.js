/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode to catch potential bugs during development
  reactStrictMode: true,

  // Build a production-ready standalone output for deployment
  output: "standalone",

  // Enable image optimization but configure for your image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },

  // Environment variables that should be available in the browser
  // Only add public variables here - sensitive variables go in .env.local
  env: {
    NEXT_PUBLIC_APP_TITLE: "SheetFlow AI",
  },

  // Headers for security - prevent clickjacking, XSS attacks
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;

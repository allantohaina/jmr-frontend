import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Optimize images (remove unoptimized for prod)
  images: {
    // Enable image optimization and use modern formats
    unoptimized: process.env.NODE_ENV !== "production",
    formats: ["image/avif", "image/webp"],
    // Limit sizes to optimize
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Caching
    minimumCacheTTL: 60,
  },
  // Compression (gzip and brotli)
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Don't cache dynamic pages
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin-backoffice",
        destination: "/backoffice",
        permanent: true,
      },
      {
        source: "/admin-backoffice/:path+",
        destination: "/backoffice/:path+",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

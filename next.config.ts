import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
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
  trailingSlash: true,
};

export default nextConfig;

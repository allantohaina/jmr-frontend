import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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

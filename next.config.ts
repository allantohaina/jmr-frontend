import type { NextConfig } from "next";

// Les en-têtes de sécurité sont déjà envoyés par Apache (.htaccess).
// Avec output:"export", next.config.headers() les duplique en balises
// <meta http-equiv>, ce qui déclenche des avertissements dans la console.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;

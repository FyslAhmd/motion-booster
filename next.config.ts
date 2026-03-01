import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger request bodies for file uploads (up to 12 MB)
  serverExternalPackages: ['bcryptjs'],
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;

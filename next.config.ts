import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hwztchapter.dramaboxdb.com',
      },
      {
        protocol: 'https',
        hostname: 'hwztvideo.dramaboxdb.com',
      },
    ],
  },
};

export default nextConfig;
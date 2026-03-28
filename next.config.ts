import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'value-gacha.com' },
    ],
  },
};

export default nextConfig;

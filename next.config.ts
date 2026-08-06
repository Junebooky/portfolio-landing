import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rvaowhriekibxtcpyalu.supabase.co",
        pathname: "/storage/v1/object/public/portfolio-landing/**",
      },
    ],
  },
};

export default nextConfig;

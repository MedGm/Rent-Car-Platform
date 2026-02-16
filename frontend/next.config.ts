import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone only in Docker (set STANDALONE=true in docker-compose)
  ...(process.env.STANDALONE === "true" ? { output: "standalone" } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

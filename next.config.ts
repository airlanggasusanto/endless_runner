import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  
  basePath: isProduction ? "/endless_runner" : "",

  allowedDevOrigins: ["192.168.1.4"],

  images: {
    unoptimized: true, // Required for next/image to work with static exports
  },
};

export default nextConfig;
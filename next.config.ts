import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  
  // If your GitHub repository is named "endless_runner" (not your-username.github.io), 
  // uncomment the next line and replace with your exact repo name:
  // basePath: "/endless_runner",

  images: {
    unoptimized: true, // Required for next/image to work with static exports
  },
};

export default nextConfig;
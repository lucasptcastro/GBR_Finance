import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "terra-yttriferous-linda.ngrok-free.dev",
  ],
};

export default nextConfig;

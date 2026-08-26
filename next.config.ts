import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: ["local-web.oikos.company"],
  experimental: {
    turbopackRustReactCompiler: true,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;

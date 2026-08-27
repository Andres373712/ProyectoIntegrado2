import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    images: {
          remotePatterns: [
            { protocol: "https", hostname: "proyectointegrado2-production.up.railway.app" },
            { protocol: "http", hostname: "localhost", port: "5000" },
                ],
    },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'fuse.js'],
  },
};

export default nextConfig;

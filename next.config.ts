import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for production deploys (Docker / VPS / Function Compute).
  // The "build" script in package.json copies static assets into .next/standalone.
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-*.space-z.ai",
    "*.space-z.ai",
  ],
  async redirects() {
    return [
      // The two consultations merged into one service (style-wardrobe-consultation)
      { source: '/services/style-consultation', destination: '/services/style-wardrobe-consultation', permanent: true },
      { source: '/services/wardrobe-consultation', destination: '/services/style-wardrobe-consultation', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "z-ai-cloud.oss-cn-hangzhou.aliyuncs.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
      // Supabase Storage — for product images uploaded via admin dashboard
      { protocol: "https", hostname: "dpvkzrtxnoccprryerds.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel doesn't need "standalone" output. Set this to "standalone" only
  // when deploying to Docker / Aliyun Function Compute.
  // output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-*.space-z.ai",
    "*.space-z.ai",
  ],
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
  // Security headers applied to every response.
  // (A strict CSP is intentionally omitted: Next.js injects inline scripts
  // and NextAuth posts cross-origin form data, so a hand-rolled CSP risks
  // bricking the storefront. Revisit with nonce-based CSP later.)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Blocks clickjacking — site can only be framed by itself.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevents MIME-sniffing attacks.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only sends the origin on cross-origin navigations.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disables powerful browser features we don't use.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Forces HTTPS for 2 years once deployed on HTTPS (Vercel).
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Isolates the site from cross-origin timing/Spectre-style reads.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

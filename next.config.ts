import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict TypeScript mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization domains (add your S3 bucket domain)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "mswahyxhpaiuztsxbuga.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
    // Disable private IP check for Supabase (development only)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },

  // Server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

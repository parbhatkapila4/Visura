import type { NextConfig } from "next";
import path from "path";

const splineReactSpline = path.join(
  __dirname,
  "node_modules",
  "@splinetool",
  "react-spline",
  "dist",
  "react-spline.js"
);
const splineRuntime = path.join(
  __dirname,
  "node_modules",
  "@splinetool",
  "runtime",
  "build",
  "runtime.js"
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
  turbopack: {
    resolveAlias: {
      "@splinetool/react-spline": splineReactSpline,
      "@splinetool/runtime": splineRuntime,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "."),
      "@splinetool/react-spline": splineReactSpline,
      "@splinetool/runtime": splineRuntime,
    };

    config.resolve.extensions = [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".json",
      ...(config.resolve.extensions || []),
    ];

    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.dev",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "pdfjs-dist",
    "tesseract.js",
    "pdf-parse",
  ],

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
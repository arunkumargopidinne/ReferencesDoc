// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   serverExternalPackages: [
//     "@napi-rs/canvas",
//     "pdfjs-dist",
//     "tesseract.js",
//     "pdf-parse",
//   ],

//   typescript: {
//     ignoreBuildErrors: true,
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist", "tesseract.js", "pdf-parse"],
  outputFileTracingIncludes: {
    "/api/extract-pdf-text": [
      "./node_modules/@napi-rs/canvas/**/*",
      "./node_modules/pdf-parse/**/*",
      "./node_modules/pdf-parse/node_modules/pdfjs-dist/**/*",
      "./node_modules/pdfjs-dist/legacy/build/**/*",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
      "./node_modules/tesseract.js/dist/**/*",
      "./node_modules/tesseract.js/src/**/*",
      "./node_modules/tesseract.js-core/**/*",
    ],
  },
};

export default nextConfig;


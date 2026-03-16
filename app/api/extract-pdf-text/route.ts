// // import { createRequire } from "module";
// // import { NextResponse } from "next/server";

// // export const runtime = "nodejs";

// // const require = createRequire(import.meta.url);

// // type CanvasPolyfills = {
// //   DOMMatrix?: unknown;
// //   ImageData?: unknown;
// //   Path2D?: unknown;
// // };

// // // Polyfills required for new pdfjs-dist / pdf-parse in Node.js
// // function installCanvasPolyfills() {
// //   const canvas = require("@napi-rs/canvas") as CanvasPolyfills;
// //   const g = globalThis as Record<string, unknown>;

// //   if (typeof g.DOMMatrix === "undefined" && canvas.DOMMatrix) g.DOMMatrix = canvas.DOMMatrix;
// //   if (typeof g.ImageData === "undefined" && canvas.ImageData) g.ImageData = canvas.ImageData;
// //   if (typeof g.Path2D === "undefined" && canvas.Path2D) g.Path2D = canvas.Path2D;
// // }

// // let pdfParse: any = null;

// // function getPdfParse() {
// //   if (pdfParse) return pdfParse;
// //   installCanvasPolyfills();

// //   const loaded = require("pdf-parse");
// //   pdfParse = typeof loaded === "function" ? loaded : loaded.default;
// //   if (typeof pdfParse !== "function") throw new Error("Failed to initialize pdf parser");
// //   return pdfParse;
// // }

// // // OCR fallback function via tesseract.js and pdfjs rendering on napi-RS Canvas
// // async function ocrPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
// //   installCanvasPolyfills();
// //   const { createCanvas } = require("@napi-rs/canvas");
// //   const Tesseract = require("tesseract.js");

// //   // Use legacy build for Node.js compat
// //   const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

// //   const loadingTask = pdfjsLib.getDocument({
// //     data: new Uint8Array(buffer),
// //     standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
// //   });

// //   const pdfDoc = await loadingTask.promise;
// //   let ocrText = "";

// //   // Process at most 3 pages to prevent 504 timeouts on heavier scanned PDFs
// //   const pagesToOcr = Math.min(pdfDoc.numPages, 3);

// //   for (let i = 1; i <= pagesToOcr; i++) {
// //     const page = await pdfDoc.getPage(i);
// //     const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for clear OCR
// //     const canvas = createCanvas(viewport.width, viewport.height);
// //     const ctx = canvas.getContext("2d");

// //     await page.render({
// //       canvasContext: ctx as any,
// //       viewport,
// //     }).promise;

// //     const imageBuffer = canvas.toBuffer("image/png");

// //     // Extract text array from PNG
// //     const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
// //     ocrText += text + "\n";
// //   }

// //   return { text: ocrText.trim(), pages: pdfDoc.numPages };
// // }

// // function isPdfFile(file: File) {
// //   return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
// // }

// // export async function POST(req: Request) {
// //   try {
// //     const form = await req.formData();
// //     const entry = form.get("file");

// //     if (!(entry instanceof File)) {
// //       return NextResponse.json({ error: "No file provided" }, { status: 400 });
// //     }
// //     if (!isPdfFile(entry)) {
// //       return NextResponse.json(
// //         { error: "Only PDF files are supported on this endpoint." },
// //         { status: 400 }
// //       );
// //     }

// //     const buffer = Buffer.from(await entry.arrayBuffer());

// //     // First, try standard text extraction (very fast)
// //     let standardText = "";
// //     let pages = 0;

// //     try {
// //       const parser = getPdfParse();
// //       const parsed = await parser(buffer);
// //       standardText = (parsed.text || "").trim();
// //       pages = typeof parsed.numpages === "number" ? parsed.numpages : 0;
// //     } catch (e: any) {
// //       console.error("Standard PDF parsing error:", e.message);
// //     }

// //     let responseBody: { text: string; pages: number; warning?: string } = {
// //       text: standardText,
// //       pages,
// //     };

// //     // If PDF yields no readable text natively (common with scanned images), we do OCR!
// //     if (standardText.length < 50) {
// //       console.log("No readable text found via standard extraction. Falling back to OCR processing...");
// //       try {
// //         const ocrResult = await ocrPdf(buffer);
// //         responseBody.text = ocrResult.text || standardText;
// //         responseBody.pages = ocrResult.pages || pages;

// //         if (responseBody.pages > 3) {
// //           responseBody.warning = "Warning: Only the first 3 pages were processed using OCR to prevent long wait times.";
// //         } else {
// //           responseBody.warning = "Document was processed using OCR as no native text was detected.";
// //         }
// //       } catch (ocrErr: any) {
// //         console.error("OCR Engine Error:", ocrErr);
// //         responseBody.warning = "No readable text found natively, and OCR fallback failed.";
// //       }
// //     }

// //     return NextResponse.json(responseBody);
// //   } catch (err: any) {
// //     console.error("Endpoint failure:", err);
// //     return NextResponse.json({ error: err.message || "Failed to extract PDF text" }, { status: 500 });
// //   }
// // }


import { createRequire } from "module";
import { NextResponse } from "next/server";
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");


export const runtime = "nodejs";

const require = createRequire(import.meta.url);

type CanvasPolyfills = {
  DOMMatrix?: unknown;
  ImageData?: unknown;
  Path2D?: unknown;
};

function installCanvasPolyfills() {
  const canvas = require("@napi-rs/canvas") as CanvasPolyfills;
  const g = globalThis as Record<string, unknown>;

  if (typeof g.DOMMatrix === "undefined" && canvas.DOMMatrix) g.DOMMatrix = canvas.DOMMatrix;
  if (typeof g.ImageData === "undefined" && canvas.ImageData) g.ImageData = canvas.ImageData;
  if (typeof g.Path2D === "undefined" && canvas.Path2D) g.Path2D = canvas.Path2D;
}

let pdfParse: any = null;

function getPdfParse() {
  if (pdfParse) return pdfParse;
  installCanvasPolyfills();

  const loaded = require("pdf-parse");
  pdfParse = typeof loaded === "function" ? loaded : loaded.default;
  if (typeof pdfParse !== "function") throw new Error("Failed to initialize pdf parser");
  return pdfParse;
}

async function ocrPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
  installCanvasPolyfills();
  const { createCanvas } = require("@napi-rs/canvas");
  const Tesseract = require("tesseract.js");

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
  });

  const pdfDoc = await loadingTask.promise;
  let ocrText = "";

  const pagesToOcr = pdfDoc.numPages; // process all pages

  for (let i = 1; i <= pagesToOcr; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    await page.render({
      canvasContext: ctx as any,
      viewport,
    }).promise;

    const imageBuffer = canvas.toBuffer("image/png");
    const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
    ocrText += text + "\n";
  }

  return { text: ocrText.trim(), pages: pdfDoc.numPages };
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const entry = form.get("file");

    if (!(entry instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!isPdfFile(entry)) {
      return NextResponse.json(
        { error: "Only PDF files are supported on this endpoint." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await entry.arrayBuffer());

    let standardText = "";
    let pages = 0;

    try {
      const parser = getPdfParse();
      const parsed = await parser(buffer);
      standardText = (parsed.text || "").trim();
      pages = typeof parsed.numpages === "number" ? parsed.numpages : 0;
    } catch (e: any) {
      console.error("Standard PDF parsing error:", e.message);
    }

    let responseBody: { text: string; pages: number; warning?: string } = {
      text: standardText,
      pages,
    };

    if (standardText.length < 50) {
      console.log("No readable text found via standard extraction. Falling back to OCR processing...");
      try {
        const ocrResult = await ocrPdf(buffer);
        responseBody.text = ocrResult.text || standardText;
        responseBody.pages = ocrResult.pages || pages;
        responseBody.warning = "Document was processed using OCR as no native text was detected.";
      } catch (ocrErr: any) {
        console.error("OCR Engine Error:", ocrErr);
        responseBody.warning = "No readable text found natively, and OCR fallback failed.";
      }
    }

    return NextResponse.json(responseBody);
  } catch (err: any) {
    console.error("Endpoint failure:", err);
    return NextResponse.json({ error: err.message || "Failed to extract PDF text" }, { status: 500 });
  }
}

// import { createRequire } from "module";
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";

// const require = createRequire(import.meta.url);

// type CanvasPolyfills = {
//   DOMMatrix?: unknown;
//   ImageData?: unknown;
//   Path2D?: unknown;
// };

// function installCanvasPolyfills() {
//   const canvas = require("@napi-rs/canvas") as CanvasPolyfills;
//   const g = globalThis as Record<string, unknown>;

//   if (typeof g.DOMMatrix === "undefined" && canvas.DOMMatrix) g.DOMMatrix = canvas.DOMMatrix;
//   if (typeof g.ImageData === "undefined" && canvas.ImageData) g.ImageData = canvas.ImageData;
//   if (typeof g.Path2D === "undefined" && canvas.Path2D) g.Path2D = canvas.Path2D;
// }

// let pdfParse: any = null;

// function getPdfParse() {
//   if (pdfParse) return pdfParse;

//   installCanvasPolyfills();

//   const loaded = require("pdf-parse");
//   pdfParse = typeof loaded === "function" ? loaded : loaded.default;

//   if (typeof pdfParse !== "function") {
//     throw new Error("Failed to initialize pdf parser");
//   }

//   return pdfParse;
// }

// async function ocrPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
//   installCanvasPolyfills();

//   const { createCanvas } = require("@napi-rs/canvas");
//   const Tesseract = require("tesseract.js");

//   const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

//   const loadingTask = pdfjsLib.getDocument({
//     data: new Uint8Array(buffer),
//     standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
//   });

//   const pdfDoc = await loadingTask.promise;

//   let ocrText = "";
//   const pagesToOcr = pdfDoc.numPages;

//   for (let i = 1; i <= pagesToOcr; i++) {
//     const page = await pdfDoc.getPage(i);

//     const viewport = page.getViewport({ scale: 2.0 });

//     const canvas = createCanvas(viewport.width, viewport.height);
//     const ctx = canvas.getContext("2d");

//     await page.render({
//       canvasContext: ctx as any,
//       viewport,
//       canvas,
//     } as any).promise;

//     const imageBuffer = canvas.toBuffer("image/png");

//     const {
//       data: { text },
//     } = await Tesseract.recognize(imageBuffer, "eng");

//     ocrText += text + "\n";
//   }

//   return {
//     text: ocrText.trim(),
//     pages: pdfDoc.numPages,
//   };
// }

// function isPdfFile(file: File) {
//   return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
// }

// export async function POST(req: Request) {
//   try {
//     const form = await req.formData();
//     const entry = form.get("file");

//     if (!(entry instanceof File)) {
//       return NextResponse.json(
//         { error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     if (!isPdfFile(entry)) {
//       return NextResponse.json(
//         { error: "Only PDF files are supported on this endpoint." },
//         { status: 400 }
//       );
//     }

//     const buffer = Buffer.from(await entry.arrayBuffer());

//     let standardText = "";
//     let pages = 0;

//     try {
//       const parser = getPdfParse();

//       const parsed = await parser(buffer);

//       standardText = (parsed.text || "").trim();
//       pages = typeof parsed.numpages === "number" ? parsed.numpages : 0;

//     } catch (e: any) {
//       console.error("Standard PDF parsing error:", e.message);
//     }

//     let responseBody: {
//       text: string;
//       pages: number;
//       warning?: string;
//     } = {
//       text: standardText,
//       pages,
//     };

//     if (standardText.length < 50) {
//       console.log(
//         "No readable text found via standard extraction. Falling back to OCR..."
//       );

//       try {
//         const ocrResult = await ocrPdf(buffer);

//         responseBody.text = ocrResult.text || standardText;
//         responseBody.pages = ocrResult.pages || pages;

//         responseBody.warning =
//           "Document processed using OCR because no native text was detected.";

//       } catch (ocrErr: any) {
//         console.error("OCR Engine Error:", ocrErr);

//         responseBody.warning =
//           "No readable text found natively, and OCR fallback failed.";
//       }
//     }

//     return NextResponse.json(responseBody);

//   } catch (err: any) {
//     console.error("Endpoint failure:", err);

//     return NextResponse.json(
//       { error: err.message || "Failed to extract PDF text" },
//       { status: 500 }
//     );
//   }
// }
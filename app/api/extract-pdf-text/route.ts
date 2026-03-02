import { createRequire } from "module";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
let pdfParse:
  | ((
      dataBuffer: Buffer,
      options?: Record<string, unknown>
    ) => Promise<{ text?: string; numpages?: number }>)
  | null = null;

type CanvasPolyfills = {
  DOMMatrix?: unknown;
  ImageData?: unknown;
  Path2D?: unknown;
};

function installCanvasPolyfills() {
  // pdf-parse@2 pulls pdf.js internals that may expect these globals in Node.
  // We provide them from @napi-rs/canvas before loading pdf-parse.
  const canvas = require("@napi-rs/canvas") as CanvasPolyfills;
  const g = globalThis as Record<string, unknown>;

  if (typeof g.DOMMatrix === "undefined" && canvas.DOMMatrix) {
    g.DOMMatrix = canvas.DOMMatrix;
  }
  if (typeof g.ImageData === "undefined" && canvas.ImageData) {
    g.ImageData = canvas.ImageData;
  }
  if (typeof g.Path2D === "undefined" && canvas.Path2D) {
    g.Path2D = canvas.Path2D;
  }
}

function getPdfParse() {
  if (pdfParse) {
    return pdfParse;
  }

  installCanvasPolyfills();

  const loaded = require("pdf-parse") as
    | ((
        dataBuffer: Buffer,
        options?: Record<string, unknown>
      ) => Promise<{ text?: string; numpages?: number }>)
    | { default?: unknown };

  if (typeof loaded === "function") {
    pdfParse = loaded;
    return pdfParse;
  }

  if (loaded && typeof loaded === "object" && typeof loaded.default === "function") {
    pdfParse = loaded.default as (
      dataBuffer: Buffer,
      options?: Record<string, unknown>
    ) => Promise<{ text?: string; numpages?: number }>;
    return pdfParse;
  }

  throw new Error("Failed to initialize pdf parser");
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }

  return "Failed to extract PDF text";
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
    const parser = getPdfParse();
    const parsed = await parser(buffer);

    const text = (parsed.text || "").trim();
    const pages = typeof parsed.numpages === "number" ? parsed.numpages : 0;

    const responseBody: { text: string; pages: number; warning?: string } = {
      text,
      pages,
    };

    if (!text) {
      responseBody.warning =
        "No readable text found in this PDF. It may be scanned/image-based and require OCR.";
    }

    return NextResponse.json(responseBody);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

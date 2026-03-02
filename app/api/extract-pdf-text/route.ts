// import { NextResponse } from "next/server";

// // We process the PDF on the server so we can use Node APIs and keep the logic
// // out of the browser. The route handler runs in the Node runtime, which is
// // why we set `runtime = "nodejs"` below. This lets us import `pdfjs-dist`
// // and avoid the DOM-specific bundle.

// export const runtime = "nodejs";

// // we will load pdfjs inside the handler via dynamic import. this keeps the
// // module off the normal bundler path and works reliably with Turbopack.
// // (the earlier static import caused errors when the module path changed.)

// // placeholder variable; real value is assigned in POST()
// let getDocument: typeof import("pdfjs-dist/legacy/build/pdf.mjs").getDocument;


// export async function POST(req: Request) {
//   try {
//     // dynamically load pdfjs so bundler doesn't choke on the mjs file path
//     if (!getDocument) {
//       const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
//       getDocument = mod.getDocument;
//     }

//     const form = await req.formData();
//     const file = form.get("file") as File | null;
//     if (!file) {
//       return NextResponse.json(
//         { error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const uint8 = new Uint8Array(arrayBuffer);

//     // load the document
//     // disable workers in Node environment; otherwise pdfjs will try to load
//     // a worker script relative to the server bundle path, which doesn't exist.
//     const loadingTask = getDocument({ data: uint8, disableWorker: true });
//     const pdf = await loadingTask.promise;

//     let fullText = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();
//       const strings = content.items.map((item: any) => item.str);
//       fullText += strings.join(" ") + "\n\n";
//     }

//     const trimmed = fullText.trim();
//     const responseBody: { text: string; warning?: string } = { text: trimmed };

//     if (!trimmed) {
//       // no readable text could be extracted – likely a scanned/image PDF
//       responseBody.warning =
//         "No readable text found in this PDF. It may be a scanned/image-based file.";
//     }

//     return NextResponse.json(responseBody);
//   } catch (err: any) {
//     console.error("extract-pdf-text error:", err);
//     return NextResponse.json(
//       { error: err?.message || "Failed to extract PDF text" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { createRequire } from "module";
import { pathToFileURL } from "url";

export const runtime = "nodejs";

// Cache the imported module across requests in dev
let pdfjs: typeof import("pdfjs-dist/legacy/build/pdf.mjs") | null = null;

async function getPdfJs() {
  if (pdfjs) return pdfjs;

  // Dynamic import so bundler doesn't choke
  pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // ✅ Fix: point workerSrc to the real worker in node_modules (not .next chunks)
  const require = createRequire(import.meta.url);
  const workerFsPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerFsPath).toString();

  return pdfjs;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uint8 = new Uint8Array(await file.arrayBuffer());

    const mod = await getPdfJs();
    const loadingTask = mod.getDocument({
      data: uint8,
      // keep as an extra safeguard (but workerSrc fix is the key)
      disableWorker: true,
    });

    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = (content.items as any[])
        .map((item) => (typeof item?.str === "string" ? item.str : ""))
        .filter(Boolean);

      fullText += strings.join(" ") + "\n\n";
    }

    const trimmed = fullText.trim();
    const responseBody: { text: string; warning?: string } = { text: trimmed };

    if (!trimmed) {
      responseBody.warning =
        "No readable text found in this PDF. It may be scanned/image-based (OCR required).";
    }

    return NextResponse.json(responseBody);
  } catch (err: any) {
    console.error("extract-pdf-text error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to extract PDF text" },
      { status: 500 }
    );
  }
}
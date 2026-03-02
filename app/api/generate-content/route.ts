
// // // import { NextResponse } from "next/server";
// // // import { callOpenAI } from "../../../src/lib/openai";

// // // export async function POST(req: Request) {
// // //   const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// // //   try {
// // //     if (!apiKey) {
// // //       return NextResponse.json(
// // //         { error: "Server misconfiguration: OPENAI_API_KEY is not set" },
// // //         { status: 500 }
// // //       );
// // //     }

// // //     const body = await req.json();
// // //     const { topics } = body;

// // //     if (!topics || !Array.isArray(topics)) {
// // //       return NextResponse.json(
// // //         { error: "Missing topics" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     const prompt = `You are an interview prep assistant...
// // // ${topics.map((t: any) => "- " + t.title).join("\n")}`;

// // //     const content = await callOpenAI(
// // //       [
// // //         { role: "system", content: "You output Markdown content only." },
// // //         { role: "user", content: prompt },
// // //       ],
// // //       { temperature: 0.3 }
// // //     );

// // //     return NextResponse.json({ markdown: content });

// // //   } catch (err: any) {
// // //     console.error(err); // 👈 add this for debugging
// // //     return NextResponse.json(
// // //       { error: err?.message || "Server error" },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // import { NextResponse } from "next/server";
// // import { callOpenAI } from "../../../src/lib/openai";

// // export const runtime = "nodejs"; // important if you ever touch fs etc.

// // function chunkArray<T>(arr: T[], size: number) {
// //   const out: T[][] = [];
// //   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
// //   return out;
// // }

// // export async function POST(req: Request) {
// //   const apiKey =
// //     process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

// //   try {
// //     if (!apiKey) {
// //       return NextResponse.json(
// //         { error: "Server misconfiguration: OPENAI_API_KEY is not set" },
// //         { status: 500 }
// //       );
// //     }

// //     const body = await req.json();
// //     const { topics } = body;

// //     if (!topics || !Array.isArray(topics) || topics.length === 0) {
// //       return NextResponse.json({ error: "Missing topics" }, { status: 400 });
// //     }

// //     // ✅ Your enhanced prompt (as a stable instruction block)
// //     const baseInstruction = `
// // Develop a comprehensive reference document that thoroughly addresses the provided questions/topics.
// // For each item, offer a detailed and in-depth explanation of the solution, ensuring clarity and thoroughness.
// // Structure the document in a clear and organized manner, utilizing distinct headings and concise summaries to enhance navigation and comprehension.
// // Provide step-by-step explanations and incorporate relevant examples or illustrations where necessary to support the content.
// // Maintain a formal and professional tone throughout the document.

// // IMPORTANT QUALITY RULES:
// // - Provide roughly equal depth for EACH topic.
// // - Do NOT heavily prioritize only the first few topics.
// // - Use consistent structure for every topic:
// //   1) Overview (2–4 lines)
// //   2) Core Concepts
// //   3) Step-by-step approach
// //   4) Example(s)
// //   5) Common mistakes & best practices
// //   6) Quick recap
// // - Output Markdown only.
// // `.trim();

// //     // ✅ Chunking strategy (prevents quality drop)
// //     // Recommended: 3–5 topics per request
// //     const CHUNK_SIZE = topics.length > 10 ? 3 : 4;
// //     const topicChunks = chunkArray(topics, CHUNK_SIZE);

// //     const parts: string[] = [];

// //     for (let idx = 0; idx < topicChunks.length; idx++) {
// //       const chunk = topicChunks[idx];

// //       const prompt = `
// // ${baseInstruction}

// // You are generating PART ${idx + 1} of ${topicChunks.length}.
// // Only write content for the topics in this part. Do not include other topics.

// // Topics for this part:
// // ${chunk.map((t: any, i: number) => `${i + 1}. ${t.title}`).join("\n")}
// // `.trim();

// //       const content = await callOpenAI(
// //         [
// //           { role: "system", content: "You output Markdown content only." },
// //           { role: "user", content: prompt },
// //         ],
// //         {
// //           temperature: 0.2, // lower temp = more consistent quality
// //           // If your callOpenAI supports it, you can also set max_tokens here.
// //         },
// //         apiKey
// //       );

// //       parts.push(content.trim());
// //     }

// //     // ✅ Merge into one markdown doc with a top heading
// //     const finalMarkdown = `
// // # Interview Prep Reference Document

// // ${parts.join("\n\n---\n\n")}
// // `.trim();

// //     return NextResponse.json({ markdown: finalMarkdown });
// //   } catch (err: any) {
// //     console.error(err);
// //     return NextResponse.json(
// //       { error: err?.message || "Server error" },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextResponse } from "next/server";
// import { callOpenAI } from "../../../src/lib/openai";

// export const runtime = "nodejs";

// function chunkArray<T>(arr: T[], size: number) {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// /**
//  * Removes unwanted markdown like **, headings, bullets, separators,
//  * while preserving fenced code blocks (```...```).
//  */
// function sanitizeForNotion(input: string) {
//   const blocks: string[] = [];
//   const placeholder = (i: number) => `__CODE_BLOCK_${i}__`;

//   // Protect fenced code blocks
//   let text = input.replace(/```[\s\S]*?```/g, (m) => {
//     const idx = blocks.length;
//     blocks.push(m);
//     return placeholder(idx);
//   });

//   // Remove bold/italics markers
//   text = text.replace(/\*\*/g, "");
//   text = text.replace(/\*/g, "");

//   // Remove markdown headings (#, ##, ###...)
//   text = text.replace(/^\s{0,3}#{1,6}\s+/gm, "");

//   // Remove bullet markers at line start (- or *)
//   text = text.replace(/^\s*[-*]\s+/gm, "");

//   // Remove horizontal rules (---)
//   text = text.replace(/^\s*---\s*$/gm, "");

//   // Remove common "document title" style lines if model still adds them
//   // (kept conservative; you can extend patterns if needed)
//   text = text.replace(/^\s*High Radius Reference Document\s*$/gim, "");
//   text = text.replace(/^\s*Comprehensive Reference Document\s*$/gim, "");

//   // Restore code blocks
//   text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_, n) => blocks[Number(n)]);

//   // Clean excessive blank lines
//   text = text.replace(/\n{3,}/g, "\n\n").trim();

//   return text;
// }

// export async function POST(req: Request) {
//   const apiKey =
//     process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

//   try {
//     if (!apiKey) {
//       return NextResponse.json(
//         { error: "Server misconfiguration: OPENAI_API_KEY is not set" },
//         { status: 500 }
//       );
//     }

//     const body = await req.json();
//     const { topics } = body;

//     if (!topics || !Array.isArray(topics) || topics.length === 0) {
//       return NextResponse.json({ error: "Missing topics" }, { status: 400 });
//     }

//     // ✅ Plain-text template: no headings, no bold, no bullets.
//     // Only allowed markdown is fenced code blocks.
//     const baseInstruction = `
// You are an interview preparation assistant.

// Return content in plain text ONLY.
// Do NOT use Markdown headings (#, ##), bold (**), italics (*), bullets (-, *), or tables.

// The ONLY allowed Markdown syntax is fenced code blocks when required:
// \`\`\`language
// code...
// \`\`\`

// For EACH topic, use this exact structure:

// <topic number>. <topic name>
// Explanation:
// (1–2 short paragraphs)

// Detailed Information:
// (2–5 short paragraphs)

// Examples:
// (1–3 examples; plain text)
// If code is needed, include it inside a fenced code block.

// STRICT RULES:
// - Do not add a document title.
// - Do not add "PART 1", "Comprehensive reference", or any intro/conclusion.
// - Keep similar depth for every topic.
// `.trim();

//     // ✅ Chunking prevents quality drop for large topic lists
//     const CHUNK_SIZE = topics.length > 10 ? 3 : 4;
//     const topicChunks = chunkArray(topics, CHUNK_SIZE);

//     const parts: string[] = [];
//     let globalIndex = 1;

//     for (let idx = 0; idx < topicChunks.length; idx++) {
//       const chunk = topicChunks[idx];

//       // Continuous numbering across chunks
//       const chunkWithNumbers = chunk.map((t: any) => ({
//         ...t,
//         __n: globalIndex++,
//       }));

//       const prompt = `
// ${baseInstruction}

// Generate content ONLY for the topics below, in the same order, using the exact numbering provided:

// ${chunkWithNumbers.map((t: any) => `${t.__n}. ${t.title}`).join("\n")}
// `.trim();

//       const content = await callOpenAI(
//         [
//           {
//             role: "system",
//             content:
//               "Return plain text only. No headings, no bold, no bullets. Only fenced code blocks allowed.",
//           },
//           { role: "user", content: prompt },
//         ],
//         { temperature: 0.2 },
//         apiKey
//       );

//       parts.push(sanitizeForNotion(content));
//     }

//     const finalMarkdown = sanitizeForNotion(parts.join("\n\n"));

//     return NextResponse.json({ markdown: finalMarkdown });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json(
//       { error: err?.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { callOpenAI } from "../../../src/lib/openai";

export const runtime = "nodejs";

function chunkArray<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Removes unwanted markdown like **, headings, bullets, separators,
 * while preserving fenced code blocks (```...```).
 */
function sanitizeForNotion(input: string) {
  const blocks: string[] = [];
  const placeholder = (i: number) => `__CODE_BLOCK_${i}__`;

  // Protect fenced code blocks
  let text = input.replace(/```[\s\S]*?```/g, (m) => {
    const idx = blocks.length;
    blocks.push(m);
    return placeholder(idx);
  });

  // Remove ALL common markdown emphasis markers
  text = text.replace(/\*\*/g, ""); // bold
  text = text.replace(/\*/g, "");   // italics
  text = text.replace(/__/g, "");   // underscore bold
  text = text.replace(/_/g, "");    // underscore italics

  // Remove markdown headings (#, ##, ###...)
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, "");

  // Remove bullet markers at line start (- or *)
  text = text.replace(/^\s*[-*]\s+/gm, "");

  // Remove horizontal rules (---)
  text = text.replace(/^\s*---\s*$/gm, "");

  // Restore code blocks
  text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_, n) => blocks[Number(n)]);

  // Clean excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

export async function POST(req: Request) {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { topics } = body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "Missing topics" }, { status: 400 });
    }

    // ✅ Strict plain text template: topic line must NOT be bold.
    const baseInstruction = `
You are an interview preparation assistant.

Return output as PLAIN TEXT ONLY.
Do NOT use any Markdown formatting at all:
- No headings (#, ##)
- No bold/italic (** or * or __ or _)
- No bullet points (-, *)
- No tables

The ONLY exception is code blocks, which MUST be in fenced format:
\`\`\`language
code...
\`\`\`

For EACH topic, use EXACTLY this structure:

<topic number>. <topic name>
Explanation:
(1–2 short paragraphs)

Detailed Information:
(2–5 short paragraphs)

Examples:
(1–3 examples; plain text)
If code is needed, include it inside a fenced code block.

STRICT RULES:
- Do not add a document title.
- Do not add "PART", introductions, conclusions, summaries for the full doc.
- Keep similar depth for every topic.
`.trim();

    // ✅ Chunking prevents quality drop for large lists
    const CHUNK_SIZE = topics.length > 10 ? 3 : 4;
    const topicChunks = chunkArray(topics, CHUNK_SIZE);

    const parts: string[] = [];
    let globalIndex = 1;

    for (let idx = 0; idx < topicChunks.length; idx++) {
      const chunk = topicChunks[idx];

      // Continuous numbering across chunks
      const chunkWithNumbers = chunk.map((t: any) => ({
        ...t,
        __n: globalIndex++,
      }));

      const prompt = `
${baseInstruction}

Generate content ONLY for the topics below, in the same order, using the exact numbering provided:

${chunkWithNumbers.map((t: any) => `${t.__n}. ${t.title}`).join("\n")}
`.trim();

      const content = await callOpenAI(
        [
          {
            role: "system",
            content:
              "Return PLAIN TEXT ONLY. No markdown formatting. Only fenced code blocks allowed.",
          },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2 },
        apiKey
      );

      parts.push(sanitizeForNotion(content));
    }

    const finalMarkdown = sanitizeForNotion(parts.join("\n\n"));

    return NextResponse.json({ markdown: finalMarkdown });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
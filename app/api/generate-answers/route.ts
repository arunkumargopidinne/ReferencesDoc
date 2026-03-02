// import { NextResponse } from "next/server";
// import { callOpenAI } from "../../../src/lib/openai";

// export const runtime = "nodejs";

// type Body = {
//   companyName?: string;
//   questions: string | string[];
//   chunkSize?: number; // optional override
// };

// function normalizeQuestions(input: string | string[]): string[] {
//   if (Array.isArray(input)) {
//     return input.map(q => String(q).trim()).filter(Boolean);
//   }

//   // If it's a big text blob, split by lines / numbering / bullets.
//   // Works for:
//   // 1) ... 2) ...  - ...  • ...
//   const lines = String(input)
//     .split(/\r?\n/)
//     .map(l => l.trim())
//     .filter(Boolean);

//   // If user pasted numbered list in a single line, try splitting by "1." "2." etc.
//   // Fallback to lines if already separated.
//   const joined = lines.join("\n");

//   const numbered = joined
//     .split(/\n(?=\d+[\).\]]\s+)/) // new line starting with 1) / 1. / 1]
//     .map(s => s.trim())
//     .filter(Boolean);

//   // If splitting didn't help, just return lines.
//   return numbered.length >= 2 ? numbered : lines;
// }

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// export async function POST(req: Request) {
//   try {
//     const body = (await req.json()) as Body;
//     const { companyName, questions, chunkSize } = body;

//     if (!questions) {
//       return NextResponse.json({ error: "Missing questions" }, { status: 400 });
//     }

//     const qList = normalizeQuestions(questions);
//     if (!qList.length) {
//       return NextResponse.json({ error: "No valid questions found" }, { status: 400 });
//     }

//     const size = Math.max(1, Math.min(Number(chunkSize) || 4, 10)); // default 4, cap at 10
//     const chunks = chunkArray(qList, size);

//     // Generate chunk-by-chunk (sequential for reliability)
//     // If you want faster, see the Promise.all variant below.
//     const results: string[] = [];

//     for (let i = 0; i < chunks.length; i++) {
//       const chunkQuestions = chunks[i];

//       const prompt = `You are an expert interviewer and instructor.

// Company: ${companyName || "N/A"}

// Answer the following questions thoroughly with:
// - Clear, step-by-step explanations
// - Small, focused code snippets only where applicable
// - Practical examples
// - Use Markdown

// Chunk ${i + 1} of ${chunks.length}

// Questions:
// ${chunkQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}
// `;

//       const content = await callOpenAI(
//         [
//           { role: "system", content: "You output Markdown content only." },
//           { role: "user", content: prompt },
//         ],
//         { temperature: 0.2 }
//       );

//       results.push(content.trim());
//     }

//     const combinedMarkdown =
//       `# ${companyName || "Interview Prep"} — Answers\n\n` +
//       results.map((md, idx) => `## Part ${idx + 1}\n\n${md}`).join("\n\n---\n\n");

//     return NextResponse.json({
//       markdown: combinedMarkdown,
//       parts: results, // optional: lets frontend show progressive sections
//       meta: { totalQuestions: qList.length, chunkSize: size, chunks: chunks.length },
//     });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
//   }
// }


// import { NextResponse } from "next/server";
// import { callOpenAI } from "../../../src/lib/openai";
// import { Client } from "@notionhq/client";
// import { markdownToBlocks } from "@tryfabric/martian";

// export const runtime = "nodejs";

// // --- Types ---
// type Body = {
//   companyName?: string;
//   questions: string | string[];
//   chunkSize?: number;
// };

// // --- Config ---
// // Ensure these are loaded. In Next.js App Router, ensure they are in .env.local
// const NOTION_TOKEN = process.env.NOTION_TOKEN;
// const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// // Initialize Notion Client
// const notion = new Client({
//   auth: NOTION_TOKEN,
// });

// // --- Helper Functions ---

// function normalizeQuestions(input: string | string[]): string[] {
//   if (Array.isArray(input)) {
//     return input.map((q) => String(q).trim()).filter(Boolean);
//   }
//   const lines = String(input)
//     .split(/\r?\n/)
//     .map((l) => l.trim())
//     .filter(Boolean);
//   const joined = lines.join("\n");
//   const numbered = joined
//     .split(/\n(?=\d+[\).\]]\s+)/)
//     .map((s) => s.trim())
//     .filter(Boolean);
//   return numbered.length >= 2 ? numbered : lines;
// }

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// /**
//  * Creates a Notion page and handles the 100-block limit by appending children sequentially.
//  */
// async function createNotionPage(title: string, markdownContent: string) {
//   if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
//     throw new Error("Missing Notion credentials");
//   }

//   // 1. Convert Markdown string to Notion Blocks JSON
//   const blocks = markdownToBlocks(markdownContent);

//   // 2. Notion API allows max 100 blocks per request. Split them.
//   const chunks = chunkArray(blocks, 100);

//   if (chunks.length === 0) return;

//   // 3. Create the Page with the first 100 blocks
//   // Note: We use the Client SDK, which is cleaner than raw fetch
//   const response = await notion.pages.create({
//     parent: { database_id: NOTION_DATABASE_ID },
//     properties: {
//       Name: {
//         title: [
//           {
//             text: {
//               content: title,
//             },
//           },
//         ],
//       },
//     },
//     // Cast to any because Martian types sometimes lag slightly behind Notion SDK strict types,
//     // but the structure is correct.
//     children: chunks[0] as any,
//   });

//   const pageId = response.id;

//   // 4. If there are more chunks, append them to the newly created page
//   if (chunks.length > 1) {
//     for (let i = 1; i < chunks.length; i++) {
//       await notion.blocks.children.append({
//         block_id: pageId,
//         children: chunks[i] as any,
//       });
//     }
//   }

//   return response;
// }

// // --- Main API Handler ---

// export async function POST(req: Request) {
//   try {
//     const body = (await req.json()) as Body;
//     const { companyName, questions, chunkSize } = body;

//     if (!questions) {
//       return NextResponse.json({ error: "Missing questions" }, { status: 400 });
//     }

//     const qList = normalizeQuestions(questions);
//     if (!qList.length) {
//       return NextResponse.json(
//         { error: "No valid questions found" },
//         { status: 400 }
//       );
//     }

//     const size = Math.max(1, Math.min(Number(chunkSize) || 4, 10));
//     const chunks = chunkArray(qList, size);
//     const results: string[] = [];

//     // 1. Generate Content via OpenAI
//     for (let i = 0; i < chunks.length; i++) {
//       const chunkQuestions = chunks[i];
//       const prompt = `You are an expert interviewer and instructor.
// Company: ${companyName || "N/A"}

// Answer the following questions thoroughly with:
// - Clear, step-by-step explanations
// - Small, focused code snippets only where applicable
// - Practical examples
// - Use Markdown formatting (headings, code blocks, bold text)
// - Do NOT wrap the entire response in a single code block.

// Chunk ${i + 1} of ${chunks.length}

// Questions:
// ${chunkQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}
// `;

//       const content = await callOpenAI(
//         [
//           { role: "system", content: "You output Markdown content only." },
//           { role: "user", content: prompt },
//         ],
//         { temperature: 0.2 }
//       );

//       results.push(content.trim());
//     }

//     const title = `${companyName || "Interview Prep"} — Answers`;
    
//     // Combine chunks for Notion
//     // We add separators so the Markdown parser creates separation between API chunks
//     const combinedMarkdown = results
//       .map((md, idx) => `## Part ${idx + 1}\n\n${md}`)
//       .join("\n\n---\n\n");

//     // 2. Save to Notion
//     // We wrap this in a try/catch specifically to not fail the HTTP response 
//     // if Notion fails, but you can choose to fail hard if preferred.
//     let notionData = null;
//     try {
//       notionData = await createNotionPage(title, combinedMarkdown);
//     } catch (notionError: any) {
//       console.error("Notion Sync Error:", notionError);
//       // We continue returning the markdown to the frontend even if Notion fails
//     }

//     return NextResponse.json({
//       success: true,
//       markdown: combinedMarkdown,
//       parts: results,
//       notionUrl: notionData ? (notionData as any).url : null,
//       meta: {
//         totalQuestions: qList.length,
//         chunkSize: size,
//         chunks: chunks.length,
//       },
//     });
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
import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";

export const runtime = "nodejs";

// --- Types ---
type Body = {
  companyName?: string;
  questions: string | string[];
  chunkSize?: number;
};

// --- Config ---
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

const notion = new Client({
  auth: NOTION_TOKEN,
});

// --- Helper Functions ---

/**
 * Removes "```markdown" at the start and "```" at the end
 * so the parser sees actual markdown, not a code block.
 */
function cleanMarkdown(text: string): string {
  let cleaned = text.trim();
  return cleaned;
}

function normalizeQuestions(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.map((q) => String(q).trim()).filter(Boolean);
  }
  const lines = String(input)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const joined = lines.join("\n");
  const numbered = joined
    .split(/\n(?=\d+[\).\]]\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return numbered.length >= 2 ? numbered : lines;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function createNotionPage(title: string, markdownContent: string) {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    throw new Error("Missing Notion credentials");
  }

  // 1. Convert Markdown to Notion Blocks
  // We use strict: false to allow some lenient parsing
  const blocks = markdownToBlocks(markdownContent);

  // 2. Split into chunks of 100 (Notion API limit)
  const chunks = chunkArray(blocks, 100);

  if (chunks.length === 0) return;

  // 3. Create Page
  const response = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: title } }],
      },
    },
    children: chunks[0] as any,
  });

  const pageId = response.id;

  // 4. Append remaining chunks
  if (chunks.length > 1) {
    for (let i = 1; i < chunks.length; i++) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: chunks[i] as any,
      });
    }
  }

  return response;
}

// --- Main Handler ---

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { companyName, questions, chunkSize } = body;

    if (!questions) {
      return NextResponse.json({ error: "Missing questions" }, { status: 400 });
    }

    const qList = normalizeQuestions(questions);
    if (!qList.length) {
      return NextResponse.json({ error: "No valid questions" }, { status: 400 });
    }

    const size = Math.max(1, Math.min(Number(chunkSize) || 4, 10));
    const chunks = chunkArray(qList, size);
    const results: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkQuestions = chunks[i];
      const prompt = `You are an expert interviewer.
Company: ${companyName || "N/A"}

Answer the following questions thoroughly.
- Provide clear, step-by-step explanations.
- Include small, focused code snippets only where applicable.
- Use practical examples.
- Format your answer in Markdown using headings, bullet points, and code blocks where appropriate.
- Do NOT wrap the entire response in a single code block.

Chunk ${i + 1} of ${chunks.length}

Questions:
${chunkQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}
`;

      const content = await callOpenAI(
        [
          { role: "system", content: "You output raw Markdown text only. Do not wrap output in code blocks." },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2 }
      );

      // Clean the output just in case OpenAI ignored instructions
      results.push(cleanMarkdown(content));
    }

    const title = `${companyName || "Interview Prep"} — Answers`;
    
    // Combine results
    const combinedMarkdown = results
      .map((md, idx) => `## Part ${idx + 1}\n\n${md}`)
      .join("\n\n");

    let notionData = null;
    let notionErrorMsg = null;

    try {
      notionData = await createNotionPage(title, combinedMarkdown);
    } catch (e: any) {
      console.error("Notion Error:", e);
      notionErrorMsg = e.message;
    }

    return NextResponse.json({
      success: true,
      markdown: combinedMarkdown,
      notionUrl: notionData ? (notionData as any).url : null,
      notionError: notionErrorMsg,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
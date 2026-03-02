// import { NextResponse } from "next/server";
// import { callOpenAI } from "../../../src/lib/openai";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { companyName, assignmentText } = body;
//     if (!assignmentText) return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });

//     const prompt = `Your task is to create a comprehensive assignment reference document in detailed step-by-step instructions so a beginner can easily understand each step.

// Structure the document as follows:
// 1. Objective: Clearly state the project's goal and purpose.
// 2. Technical Requirements: List all necessary tools, software, and hardware specifications.
// 3. Step-by-Step Instructions: Provide a sequential guide on how to complete the project, breaking down complex tasks into manageable steps.
// 4. Project Structure: Outline directories, files, and components.
// 5. Example Codes: Include relevant code snippets to illustrate key concepts, without full code solutions.

// Include the following assignment/extract below and use it to craft the document. Ensure each step is concise, actionable, and beginner-friendly.

// Assignment:
// ${assignmentText}`;

//     const content = await callOpenAI([
//       { role: "system", content: "You output Markdown content only." },
//       { role: "user", content: prompt },
//     ], { temperature: 0.2 });

//     return NextResponse.json({ markdown: content });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
//   }
// }



// import OpenAI from "openai";
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";
// // If you're on Vercel, this helps prevent premature timeout for long generations.
// // (Supported in Next.js route handlers)
// export const maxDuration = 60;

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// function buildPrompt(assignmentText: string, companyName?: string) {
//   return `
// You are an expert technical writer. Output ONLY Markdown.

// Create a comprehensive assignment reference document in detailed step-by-step instructions so a beginner can easily understand and implement.

// Hard requirements:
// - Use EXACT section order:
//   1. Objective
//   2. Technical Requirements
//   3. Step-by-Step Instructions
//   4. Project Structure
//   5. Example Codes (snippets only; no full solutions)
// - Be VERY detailed in Step-by-Step Instructions (many small steps).
// - Use headings, subheadings, bullet points, and small code snippets.
// - Do NOT stop early. If you must continue, end with: <<CONTINUE>>

// Context:
// Company (optional): ${companyName ?? "N/A"}

// Assignment:
// ${assignmentText}
// `.trim();
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { companyName, assignmentText } = body ?? {};
//     if (!assignmentText) {
//       return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
//     }

//     const prompt = buildPrompt(assignmentText, companyName);

//     // We will keep requesting continuations if the model truncates.
//     const MAX_PASSES = 6; // safety: prevents infinite loops
//     let fullMarkdown = "";
//     let nextInput = prompt;

//     for (let pass = 0; pass < MAX_PASSES; pass++) {
//       const resp = await client.responses.create({
//         model: "gpt-4.1", // example model name from OpenAI docs :contentReference[oaicite:1]{index=1}
//         input: nextInput,
//         // Increase output allowance. If it still hits the cap, we continue in the loop.
//         max_output_tokens: 8000, // tune based on your budget/limits :contentReference[oaicite:2]{index=2}
//         temperature: 0.2,
//       });

//       const chunk = resp.output_text ?? "";
//       fullMarkdown += chunk;

//       // If the model explicitly tells you to continue, or the API returns incomplete,
//       // ask it to continue from the last point.
//       const needsContinue =
//         fullMarkdown.includes("<<CONTINUE>>") ||
//         resp.status === "incomplete";

//       if (!needsContinue) break;

//       // Remove marker so final output is clean.
//       fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

//       // Continue prompt: keep it short, force continuation, avoid rewriting earlier parts.
//       nextInput = `
// Continue EXACTLY where you left off. Output ONLY Markdown.
// Do not repeat existing content. Start from the next unfinished heading/step.
// Here is what you've written so far:
// ---
// ${fullMarkdown.slice(-12000)}
// ---
// `.trim();
//     }

//     fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();

//     return NextResponse.json({ markdown: fullMarkdown });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
//   }
// }

// 

// import OpenAI from "openai";
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";
// export const maxDuration = 60;

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// /**
//  * Removes ONLY an accidental outer wrapper:
//  * ```markdown
//  *  ...doc...
//  * ```
//  * while preserving internal code fences.
//  */
// function stripOuterMarkdownFence(text: string) {
//   let out = text.trim();

//   const startFence = out.match(/^```(?:markdown|md|text)?\s*\n/i);
//   const endFence = out.match(/\n```$/);

//   if (startFence && endFence) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// /**
//  * Applies opinionated cleanup to reduce "unnecessary markdown characteristics"
//  * while preserving fenced code blocks inside the document.
//  */
// function sanitizeAssignmentMarkdown(input: string) {
//   const codeBlocks: string[] = [];
//   const placeholder = (i: number) => `__CODE_BLOCK_${i}__`;

//   // Normalize line endings
//   let text = input.replace(/\r\n/g, "\n").trim();

//   // Protect fenced code blocks first
//   text = text.replace(/```[\s\S]*?```/g, (m) => {
//     const idx = codeBlocks.length;
//     codeBlocks.push(m);
//     return placeholder(idx);
//   });

//   // 1) Remove horizontal rules like --- *** ___
//   text = text.replace(/^\s*(---|\*\*\*|___)\s*$/gm, "");

//   // 2) Remove numbered section prefixes from headings:
//   // "## 1. Objective" -> "## Objective"
//   // "### 3.1. Project Setup" -> "### Project Setup"
//   text = text.replace(
//     /^(\s{0,3}#{1,6}\s+)(\d+(?:\.\d+)*\.?\s+)(.+)$/gm,
//     "$1$3"
//   );

//   text = text.replace(/^\s{0,3}#{1,6}\s+(.+)$/gm, "**$1**");

//   // 3) Remove bold "Label:" patterns often used in lists:
//   // "**Database:** MongoDB" -> "Database: MongoDB"
//   text = text.replace(/\*\*([^*\n]+):\*\*/g, "$1:");

//   // 4) Cleanup excessive blank lines
//   text = text.replace(/\n{3,}/g, "\n\n").trim();

//   // Restore code blocks
//   text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_, n) => codeBlocks[Number(n)]);

//   return text.trim();
// }

// function buildPrompt(assignmentText: string, companyName?: string) {
//   return `
// You are an expert technical writer. Output ONLY Markdown.

// IMPORTANT:
// - Do NOT wrap the entire output in a fenced code block (no \`\`\`markdown at the top).
// - Only use fenced code blocks for small code snippets inside the document.

// Use EXACT section order:
// 1. Objective
// 2. Technical Requirements
// 3. Step-by-Step Instructions
// 4. Project Structure
// 5. Example Codes (snippets only; no full solutions)

// Be VERY detailed in Step-by-Step Instructions (many small steps).
// If you must continue, end with: <<CONTINUE>>

// Company (optional): ${companyName ?? "N/A"}

// Assignment:
// ${assignmentText}
// `.trim();
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { companyName, assignmentText } = body ?? {};

//     if (!assignmentText) {
//       return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
//     }

//     const prompt = buildPrompt(assignmentText, companyName);

//     const MAX_PASSES = 6;
//     let fullMarkdown = "";
//     let nextInput = prompt;

//     for (let pass = 0; pass < MAX_PASSES; pass++) {
//       const resp = await client.responses.create({
//         model: "gpt-4.1",
//         input: nextInput,
//         max_output_tokens: 8000,
//         temperature: 0.2,
//       });

//       const chunk = resp.output_text ?? "";
//       fullMarkdown += chunk;

//       // Remove accidental outer wrapper early (safe)
//       fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

//       const needsContinue =
//         fullMarkdown.includes("<<CONTINUE>>") || resp.status === "incomplete";

//       if (!needsContinue) break;

//       fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

//       nextInput = `
// Continue EXACTLY where you left off. Output ONLY Markdown.
// Do not repeat existing content. Do not wrap in \`\`\` fences.

// Last content:
// ---
// ${fullMarkdown.slice(-12000)}
// ---
// `.trim();
//     }

//     // Final cleanup: remove continuation + sanitize markdown “noise”
//     fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();
//     fullMarkdown = fullMarkdown.replaceAll("**", "").trim();
//     fullMarkdown = stripOuterMarkdownFence(fullMarkdown);
//     fullMarkdown = sanitizeAssignmentMarkdown(fullMarkdown);

//     return NextResponse.json({ markdown: fullMarkdown });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
//   }
// }


// import OpenAI from "openai";
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";
// export const maxDuration = 60;

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// /**
//  * Removes ONLY an accidental outer wrapper:
//  * ```markdown
//  *  ...doc...
//  * ```
//  * while preserving internal code fences.
//  */
// function stripOuterMarkdownFence(text: string) {
//   let out = text.trim();

//   const startFence = out.match(/^```(?:markdown|md|text)?\s*\n/i);
//   const endFence = out.match(/\n```$/);

//   if (startFence && endFence) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// /**
//  * Notion-friendly cleanup:
//  * - removes **bold markers**
//  * - removes fenced code markers ``` (and ```lang)
//  * - removes headings (#, ##, ###...) so Notion won't create heading blocks
//  *
//  * NOTE: This WILL remove the fence markers around code. The code text remains.
//  */
// function cleanForNotion(text: string) {
//   let out = text.replace(/\r\n/g, "\n");

//   // Remove continuation marker if ever present
//   out = out.replaceAll("<<CONTINUE>>", "");

//   // Remove bold markers
//   out = out.replaceAll("**", "");

//   // Remove ALL fenced code markers:
//   // - opening fences like ```js, ```markdown, ```anything
//   // - closing fences like ```
//   out = out.replace(/^```[^\n]*$/gm, ""); // removes lines that are only ```... (any language)
//   out = out.replace(/^```$/gm, "");       // safety (plain ```)

//   // Remove headings (#, ##, ###...) at line start
//   out = out.replace(/^\s{0,3}#{1,6}\s+/gm, "");

//   // Remove horizontal rules like --- *** ___
//   out = out.replace(/^\s*(---|\*\*\*|___)\s*$/gm, "");

//   // Clean excessive blank lines
//   out = out.replace(/\n{3,}/g, "\n\n").trim();

//   return out.trim();
// }

// /**
//  * Applies opinionated cleanup to reduce "unnecessary markdown characteristics"
//  * while preserving fenced code blocks inside the document.
//  *
//  * (You can keep this or remove it; cleanForNotion already handles your request.
//  *  Keeping it for extra cleanup like removing numbered heading prefixes.)
//  */
// function sanitizeAssignmentMarkdown(input: string) {
//   const codeBlocks: string[] = [];
//   const placeholder = (i: number) => `__CODE_BLOCK_${i}__`;

//   let text = input.replace(/\r\n/g, "\n").trim();

//   // Protect fenced code blocks first
//   text = text.replace(/```[\s\S]*?```/g, (m) => {
//     const idx = codeBlocks.length;
//     codeBlocks.push(m);
//     return placeholder(idx);
//   });

//   // Remove horizontal rules
//   text = text.replace(/^\s*(---|\*\*\*|___)\s*$/gm, "");

//   // Remove numbered section prefixes:
//   // "## 1. Objective" -> "## Objective"
//   text = text.replace(
//     /^(\s{0,3}#{1,6}\s+)(\d+(?:\.\d+)*\.?\s+)(.+)$/gm,
//     "$1$3"
//   );

//   // Remove bold label patterns: "**Database:**" -> "Database:"
//   text = text.replace(/\*\*([^*\n]+):\*\*/g, "$1:");

//   // Cleanup excessive blank lines
//   text = text.replace(/\n{3,}/g, "\n\n").trim();

//   // Restore code blocks
//   text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_, n) => codeBlocks[Number(n)]);

//   return text.trim();
// }

// function buildPrompt(assignmentText: string, companyName?: string) {
//   return `
// You are an expert technical writer. Output ONLY Markdown.

// IMPORTANT:
// - Do NOT wrap the entire output in a fenced code block (no \`\`\`markdown at the top).
// - Only use fenced code blocks for small code snippets inside the document.

// Use EXACT section order:
// 1. Objective
// 2. Technical Requirements
// 3. Step-by-Step Instructions
// 4. Project Structure
// 5. Example Codes (snippets only; no full solutions)

// Be VERY detailed in Step-by-Step Instructions (many small steps).
// If you must continue, end with: <<CONTINUE>>

// Company (optional): ${companyName ?? "N/A"}

// Assignment:
// ${assignmentText}
// `.trim();
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { companyName, assignmentText } = body ?? {};

//     if (!assignmentText) {
//       return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
//     }

//     const prompt = buildPrompt(assignmentText, companyName);

//     const MAX_PASSES = 6;
//     let fullMarkdown = "";
//     let nextInput = prompt;

//     for (let pass = 0; pass < MAX_PASSES; pass++) {
//       const resp = await client.responses.create({
//         model: "gpt-4.1",
//         input: nextInput,
//         max_output_tokens: 8000,
//         temperature: 0.2,
//       });

//       const chunk = resp.output_text ?? "";
//       fullMarkdown += chunk;

//       // Remove accidental outer wrapper early
//       fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

//       const needsContinue =
//         fullMarkdown.includes("<<CONTINUE>>") || resp.status === "incomplete";

//       if (!needsContinue) break;

//       fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

//       nextInput = `
// Continue EXACTLY where you left off. Output ONLY Markdown.
// Do not repeat existing content. Do not wrap in \`\`\` fences.

// Last content:
// ---
// ${fullMarkdown.slice(-12000)}
// ---
// `.trim();
//     }

//     // Final cleanup
//     fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();
//     fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

//     // Optional: keep this if you still want extra cleanup like removing numbered headings
//     fullMarkdown = sanitizeAssignmentMarkdown(fullMarkdown);

//     // ✅ Your requested simple removals for Notion:
//     // removes "**", "```", headings (#/##/###), etc.
//     fullMarkdown = cleanForNotion(fullMarkdown);

//     return NextResponse.json({ markdown: fullMarkdown });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
//   }
// } 

import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Removes ONLY an accidental outer wrapper:
 * ```markdown
 *  ...doc...
 * ```
 * while preserving internal code fences.
 */
function stripOuterMarkdownFence(text: string) {
  let out = text.trim();

  const startFence = out.match(/^```(?:markdown|md|text)?\s*\n/i);
  const endFence = out.match(/\n```$/);

  if (startFence && endFence) {
    out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    out = out.replace(/\n```$/, "");
  }
  return out.trim();
}

/**
 * Notion-friendly cleanup:
 * - removes **bold markers**
 * - removes fenced code markers ``` (and ```lang)
 * - removes headings (#, ##, ###...) so Notion won't create heading blocks
 * - removes horizontal rules
 *
 * NOTE: This WILL remove the fence markers around code. The code text remains.
 */
function cleanForNotion(text: string) {
  let out = text.replace(/\r\n/g, "\n");

  // Remove bold markers
  out = out.replaceAll("**", "");

  // Remove ALL fenced code markers (opening + closing)
  out = out.replace(/^```[^\n]*$/gm, ""); // lines like ```js / ```markdown / ```
  out = out.replace(/^```$/gm, ""); // safety

  // Remove headings
  out = out.replace(/^\s{0,3}#{1,6}\s+/gm, "");

  // Remove horizontal rules
  out = out.replace(/^\s*(---|\*\*\*|___)\s*$/gm, "");

  // Cleanup excessive blank lines
  out = out.replace(/\n{3,}/g, "\n\n").trim();

  return out.trim();
}

function buildPrompt(assignmentText: string, companyName?: string) {
  return `
You are an expert technical writer. Output ONLY Markdown.

IMPORTANT:
- Do NOT wrap the entire output in a fenced code block (no \`\`\`markdown at the top).
- Only use fenced code blocks for small code snippets inside the document.

Use EXACT section order:
1. Objective
2. Technical Requirements
3. Step-by-Step Instructions
4. Project Structure
5. Example Codes (snippets only; no full solutions)

Hard requirements:
- Be VERY detailed in Step-by-Step Instructions (many small steps).
- Use headings, subheadings, bullet points, and small code snippets.
- Do NOT stop early. If you must continue, end with: <<CONTINUE>>

Context:
Company (optional): ${companyName ?? "N/A"}

Assignment:
${assignmentText}
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, assignmentText } = body ?? {};

    if (!assignmentText) {
      return NextResponse.json(
        { error: "Missing assignmentText" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(assignmentText, companyName);

    // We will keep requesting continuations if the model truncates.
    const MAX_PASSES = 10; // increased for long docs (still safe)
    let fullMarkdown = "";
    let nextInput = prompt;

    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const resp = await client.responses.create({
        model: "gpt-4.1",
        input: nextInput,
        max_output_tokens: 8000,
        temperature: 0.2,
      });

      const chunk = resp.output_text ?? "";
      fullMarkdown += chunk;

      // remove accidental outer wrapper early (safe)
      fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

      // If the model explicitly tells you to continue, or the API returns incomplete,
      // ask it to continue from the last point.
      const needsContinue =
        fullMarkdown.includes("<<CONTINUE>>") ||
        resp.status === "incomplete";

      if (!needsContinue) break;

      // Remove marker so final output is clean (but only the CONTINUE marker)
      fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

      // Continue prompt: keep it short, force continuation, avoid rewriting earlier parts.
      nextInput = `
Continue EXACTLY where you left off. Output ONLY Markdown.
Do not repeat existing content. Start from the next unfinished heading/step.
Do not wrap in \`\`\` fences.

Here is what you've written so far:
---
${fullMarkdown.slice(-12000)}
---
`.trim();
    }

    // Final cleanup: remove any remaining continuation markers
    fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();

    // Ensure no accidental outer wrapper remains
    fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

    // Apply Notion cleanup LAST
    fullMarkdown = cleanForNotion(fullMarkdown);

    return NextResponse.json({ markdown: fullMarkdown });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
// import OpenAI from "openai";
// import { NextResponse } from "next/server";
// import { buildGenerateAssignmentPrompt } from "../../../src/lib/prompts";

// export const runtime = "nodejs";
// export const maxDuration = 60;

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // Use env override first, then fall back to gpt-4o-mini
// const MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

// function stripOuterMarkdownFence(text: string) {
//   let out = text.trim();
//   if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// function normalizeMarkdown(text: string) {
//   let out = text.replace(/\r\n/g, "\n").trim();
//   out = stripOuterMarkdownFence(out);
//   out = out.replace(/\n{3,}/g, "\n\n").trim();
//   return out;
// }


// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { companyName, assignmentText, frontendTechnologies, backendTechnologies, timeline } = body ?? {};

//     if (!assignmentText) {
//       return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
//     }

//     const prompt = buildGenerateAssignmentPrompt(assignmentText, companyName, {
//       frontendTechnologies,
//       backendTechnologies,
//       timeline,
//     });
//     const MAX_PASSES = 10;
//     let fullMarkdown = "";
//     let nextInput = prompt;

//     for (let pass = 0; pass < MAX_PASSES; pass++) {
//       const resp = await client.chat.completions.create({
//         model: MODEL,
//         messages: [{ role: "user", content: nextInput }],
//         max_tokens: 4000,
//         temperature: 0.2,
//       });

//       const chunk = resp.choices[0]?.message?.content ?? "";
//       fullMarkdown += chunk;
//       fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

//       const needsContinue =
//         fullMarkdown.includes("<<CONTINUE>>") ||
//         resp.choices[0]?.finish_reason === "length";

//       if (!needsContinue) break;

//       fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

//       nextInput = `
// Continue EXACTLY where you left off. Output ONLY Markdown.
// Do not repeat existing content. Start from the next unfinished heading/step.
// Do not wrap in \`\`\` fences.

// Here is what you've written so far:
// ---
// ${fullMarkdown.slice(-4000)}
// ---
// `.trim();
//     }

//     fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();
//     fullMarkdown = normalizeMarkdown(fullMarkdown);

//     return NextResponse.json({ markdown: fullMarkdown });
//   } catch (err: unknown) {
//     console.error("OpenAI Error:", err);
//     return NextResponse.json(
//       { error: err instanceof Error ? err.message : "Server error" },
//       { status: 500 }
//     );
//   }
// }


// Working well

// import { NextResponse } from "next/server";
// import { buildGenerateAssignmentPrompt } from "../../../src/lib/prompts";
// import { callOpenAI } from "../../../src/lib/openai";

// export const runtime = "nodejs";
// export const maxDuration = 60;

// function stripOuterMarkdownFence(text: string) {
//   let out = text.trim();
//   if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// function normalizeMarkdown(text: string) {
//   let out = text.replace(/\r\n/g, "\n").trim();
//   out = stripOuterMarkdownFence(out);
//   out = out.replace(/\n{3,}/g, "\n\n").trim();
//   return out;
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { companyName, assignmentText, frontendTechnologies, backendTechnologies, timeline } =
//       body ?? {};

//     if (!assignmentText) {
//       return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
//     }

//     const prompt = buildGenerateAssignmentPrompt(assignmentText, companyName, {
//       frontendTechnologies,
//       backendTechnologies,
//       timeline,
//     });

//     const MAX_PASSES = 10;
//     let fullMarkdown = "";
//     let nextInput = prompt;

//     for (let pass = 0; pass < MAX_PASSES; pass++) {
//       const chunk = await callOpenAI(
//         [{ role: "user", content: nextInput }],
//         { temperature: 0.2, max_tokens: 4000 }
//       );

//       fullMarkdown += chunk;
//       fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

//       const needsContinue =
//         fullMarkdown.includes("<<CONTINUE>>") ||
//         chunk.length >= 3900; // approximate length finish

//       if (!needsContinue) break;

//       fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

//       nextInput = `
// Continue EXACTLY where you left off. Output ONLY Markdown.
// Do not repeat existing content. Start from the next unfinished heading/step.
// Do not wrap in \`\`\` fences.

// Here is what you've written so far:
// ---
// ${fullMarkdown.slice(-4000)}
// ---
// `.trim();
//     }

//     fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();
//     fullMarkdown = normalizeMarkdown(fullMarkdown);

//     return NextResponse.json({ markdown: fullMarkdown });
//   } catch (err: unknown) {
//     console.error("Generate Assignment Error:", err);
//     return NextResponse.json(
//       { error: err instanceof Error ? err.message : "Server error" },
//       { status: 500 }
//     );
//   }
// }




// import { NextResponse } from "next/server";
// import { buildGenerateAssignmentPrompt } from "../../../src/lib/prompts";
// import { callOpenAI } from "../../../src/lib/openai";

// export const runtime = "nodejs";
// export const maxDuration = 60;

// function stripOuterMarkdownFence(text: string) {
//   let out = text.trim();
//   if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// function stripAllMarkdownFences(text: string): string {
//   return text
//     .replace(/^```(?:markdown|md|text)\s*$/gim, "")
//     .replace(/^```\s*$/gm, "")
//     .trim();
// }

// function normalizeMarkdown(text: string) {
//   let out = text.replace(/\r\n/g, "\n").trim();
//   out = stripOuterMarkdownFence(out);
//   out = stripAllMarkdownFences(out);
//   out = out.replace(/\n{3,}/g, "\n\n").trim();
//   return out;
// }

// function hasFolderStructure(text: string) {
//   return /folder structure|project structure|recommended structure/i.test(text);
// }

// function hasSubmissionGuidelines(text: string) {
//   return /submission guidelines|how to submit|submission process/i.test(text);
// }

// function hasBadEnding(text: string) {
//   return /(^|\n)#+\s*(conclusion|final thoughts|summary|wrap[- ]?up)/i.test(text);
// }

// function looksDetailedEnough(text: string) {
//   return text.length > 5000;
// }

// function isCompleteDocument(text: string) {
//   return (
//     hasFolderStructure(text) &&
//     hasSubmissionGuidelines(text) &&
//     !hasBadEnding(text) &&
//     looksDetailedEnough(text) &&
//     !text.includes("<<CONTINUE>>")
//   );
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       companyName,
//       assignmentText,
//       frontendTechnologies,
//       backendTechnologies,
//       timeline,
//     } = body ?? {};

//     if (!assignmentText) {
//       return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
//     }

//     const prompt = buildGenerateAssignmentPrompt(assignmentText, companyName, {
//       frontendTechnologies,
//       backendTechnologies,
//       timeline,
//     });

//     const MAX_PASSES = 6;
//     let fullMarkdown = "";
//     let nextInput = prompt;

//     for (let pass = 0; pass < MAX_PASSES; pass++) {
//       const chunk = await callOpenAI(
//         [{ role: "user", content: nextInput }],
//         { temperature: 0.2, max_tokens: 4000 }
//       );

//       fullMarkdown += "\n" + chunk;
//       fullMarkdown = normalizeMarkdown(fullMarkdown);
//       fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();

//       if (isCompleteDocument(fullMarkdown)) {
//         break;
//       }

//       nextInput = `
// Continue the same assignment reference document in Markdown only.

// Strict rules:
// - Continue exactly from where you stopped.
// - Do not repeat earlier content.
// - Do NOT wrap any part of the output in a code block or markdown fence.
// - Do NOT use \`\`\`markdown, \`\`\`md, \`\`\`text, or any \`\`\` fence anywhere in the response.
// - Make the document more detailed wherever sections are too short.
// - Make sure the final document includes:
//   - complete feature explanations
//   - implementation guidance
//   - recommended folder structure
//   - submission guidelines as the final section
// - Do not add conclusion or summary.
// - If still incomplete due to output limit, end with:
// <<CONTINUE>>

// Last generated content:
// ---
// ${fullMarkdown.slice(-6000)}
// ---
//       `.trim();
//     }

//     fullMarkdown = normalizeMarkdown(fullMarkdown);

//     if (!isCompleteDocument(fullMarkdown)) {
//       const repairPrompt = `
// You are given an incomplete assignment reference document in Markdown.

// Your task is to rewrite and complete it into a fully detailed student-friendly assignment guide.

// Mandatory requirements:
// - Output pure Markdown ONLY.
// - Do NOT wrap any part of the output in a code block or markdown fence.
// - Do NOT use \`\`\`markdown, \`\`\`md, \`\`\`text, or any \`\`\` fence anywhere in the response.
// - Explain all assignment requirements and features in detail.
// - Include implementation guidance.
// - Include recommended folder structure.
// - Include submission guidelines as the final section.
// - Do not include conclusion, summary, or final note after submission guidelines.

// Existing document:
// ---
// ${fullMarkdown}
// ---

// Original assignment:
// ---
// ${assignmentText}
// ---
//       `.trim();

//       const repaired = await callOpenAI(
//         [{ role: "user", content: repairPrompt }],
//         { temperature: 0.2, max_tokens: 4000 }
//       );

//       fullMarkdown = normalizeMarkdown(repaired);
//     }

//     return NextResponse.json({ markdown: fullMarkdown });
//   } catch (err: unknown) {
//     console.error("Generate Assignment Error:", err);
//     return NextResponse.json(
//       { error: err instanceof Error ? err.message : "Server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { buildGenerateAssignmentPrompt } from "../../../src/lib/prompts";
import { callOpenAI } from "../../../src/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

function stripOuterMarkdownFence(text: string) {
  let out = text.trim();
  if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
    out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    out = out.replace(/\n```$/, "");
  }
  return out.trim();
}

function stripAllMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:markdown|md|text)\s*$/gim, "")
    .replace(/^```\s*$/gm, "")
    .trim();
}

function normalizeMarkdown(text: string) {
  let out = text.replace(/\r\n/g, "\n").trim();
  out = stripOuterMarkdownFence(out);
  out = stripAllMarkdownFences(out);
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

function hasSubmissionGuidelines(text: string) {
  return (
    /submission guidelines/i.test(text) &&
    /github repository/i.test(text) &&
    /screen recording/i.test(text)
  );
}

function hasProjectStructure(text: string) {
  return /project structure/i.test(text);
}

function hasBadEnding(text: string) {
  // Detects content added AFTER submission guidelines
  const subIdx = text.search(/submission guidelines/i);
  if (subIdx === -1) return false;
  const afterSubmission = text.slice(subIdx + "submission guidelines".length);
  // If there's a new heading after submission guidelines, that's a bad ending
  return /\n#+\s+\w+/.test(afterSubmission);
}

function isCompleteDocument(text: string): boolean {
  return (
    hasProjectStructure(text) &&
    hasSubmissionGuidelines(text) &&
    !hasBadEnding(text) &&
    text.length > 3000 &&
    !text.includes("<<CONTINUE>>")
  );
}

/**
 * Cuts everything after the last bullet of Submission Guidelines.
 * Finds the Screen Recording line and trims anything after it.
 */
function cutAfterSubmissionGuidelines(text: string): string {
  // Find the last occurrence of the Screen Recording bullet
  const match = text.match(/([\s\S]*screen recording link[^\n]*)/i);
  if (match) {
    return match[1].trim();
  }
  return text.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      assignmentText,
      frontendTechnologies,
      backendTechnologies,
      timeline,
    } = body ?? {};

    if (!assignmentText) {
      return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
    }

    const prompt = buildGenerateAssignmentPrompt(assignmentText, companyName, {
      frontendTechnologies,
      backendTechnologies,
      timeline,
    });

    const MAX_PASSES = 6;
    let fullMarkdown = "";
    let nextInput = prompt;

    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const chunk = await callOpenAI(
        [{ role: "user", content: nextInput }],
        { temperature: 0.2, max_tokens: 4000 }
      );

      // FIX: Append the new chunk to fullMarkdown
      fullMarkdown = normalizeMarkdown(fullMarkdown + "\n" + chunk);
      fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();

      // FIX: Stop immediately if document is complete — do NOT run repair
      if (isCompleteDocument(fullMarkdown)) {
        break;
      }

      // Only continue if genuinely cut off mid-document
      // (chunk hit token limit AND submission guidelines not yet written)
      const hitTokenLimit = chunk.trim().length >= 3800;
      const notYetDone = !hasSubmissionGuidelines(fullMarkdown);

      if (!hitTokenLimit || !notYetDone) {
        // Document finished naturally but may be slightly incomplete —
        // still better than running a full repair that duplicates content
        break;
      }

      nextInput = `
Continue the assignment reference document in Markdown only.

Rules:
- Continue EXACTLY from where you stopped — do not repeat any earlier content.
- Do NOT re-write sections that are already complete.
- Do NOT wrap output in any markdown fence or code block.
- Complete any unfinished section, then continue with remaining sections.
- The final section must be "Submission Guidelines" with exactly these 3 bullets:
  - GitHub Repository Link – containing the complete project source code
  - Published / Deployed Project Link – live application URL
  - Screen Recording Link – a short video explaining the project, features, and code walkthrough
- After those 3 bullets, STOP. Do not add any conclusion, summary, or extra steps.
- If you still cannot finish in one response, end with: <<CONTINUE>>

Here is the document so far:
---
${fullMarkdown.slice(-5000)}
---
`.trim();
    }

    // Final cleanup: cut anything that leaked after Submission Guidelines
    if (hasBadEnding(fullMarkdown)) {
      fullMarkdown = cutAfterSubmissionGuidelines(fullMarkdown);
    }

    fullMarkdown = normalizeMarkdown(fullMarkdown);

    return NextResponse.json({ markdown: fullMarkdown });
  } catch (err: unknown) {
    console.error("Generate Assignment Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
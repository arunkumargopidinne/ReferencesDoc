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

function normalizeMarkdown(text: string) {
  let out = text.replace(/\r\n/g, "\n").trim();
  out = stripOuterMarkdownFence(out);
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, assignmentText, frontendTechnologies, backendTechnologies, timeline } =
      body ?? {};

    if (!assignmentText) {
      return NextResponse.json({ error: "Missing assignmentText" }, { status: 400 });
    }

    const prompt = buildGenerateAssignmentPrompt(assignmentText, companyName, {
      frontendTechnologies,
      backendTechnologies,
      timeline,
    });

    const MAX_PASSES = 10;
    let fullMarkdown = "";
    let nextInput = prompt;

    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const chunk = await callOpenAI(
        [{ role: "user", content: nextInput }],
        { temperature: 0.2, max_tokens: 4000 }
      );

      fullMarkdown += chunk;
      fullMarkdown = stripOuterMarkdownFence(fullMarkdown);

      const needsContinue =
        fullMarkdown.includes("<<CONTINUE>>") ||
        chunk.length >= 3900; // approximate length finish

      if (!needsContinue) break;

      fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trimEnd();

      nextInput = `
Continue EXACTLY where you left off. Output ONLY Markdown.
Do not repeat existing content. Start from the next unfinished heading/step.
Do not wrap in \`\`\` fences.

Here is what you've written so far:
---
${fullMarkdown.slice(-4000)}
---
`.trim();
    }

    fullMarkdown = fullMarkdown.replaceAll("<<CONTINUE>>", "").trim();
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
// // import { NextResponse } from "next/server";
// // import { callOpenAI } from "../../../src/lib/openai";
// // import {
// //   GENERATE_CONTENT_SYSTEM,
// //   buildGenerateContentChunkPrompt,
// // } from "../../../src/lib/prompts";

// // export const runtime = "nodejs";

// // type TopicInput = string | Record<string, unknown>;

// // function chunkArray<T>(arr: T[], size: number): T[][] {
// //   const out: T[][] = [];
// //   for (let i = 0; i < arr.length; i += size) {
// //     out.push(arr.slice(i, i + size));
// //   }
// //   return out;
// // }

// // function normalizeMarkdown(input: string): string {
// //   let text = (input || "").replace(/\r\n/g, "\n").trim();
// //   const hasOuterFence =
// //     /^```(?:markdown|md|text)?\s*\n/i.test(text) && /\n```$/.test(text);

// //   if (hasOuterFence) {
// //     text = text.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
// //     text = text.replace(/\n```$/, "");
// //   }

// //   return text.replace(/\n{3,}/g, "\n\n").trim();
// // }

// // function topicToTitle(topic: TopicInput): string {
// //   if (typeof topic === "string") return topic.trim();
// //   if (topic && typeof topic === "object" && typeof topic.title === "string") {
// //     return topic.title.trim();
// //   }
// //   return String(topic ?? "").trim();
// // }

// // function topicToTech(topic: TopicInput): string {
// //   if (topic && typeof topic === "object" && typeof topic.tech === "string") {
// //     return topic.tech.trim();
// //   }
// //   return "";
// // }

// // function upliftTopicHeadings(markdown: string): string {
// //   return markdown.replace(/^##(?!#)\s+/gm, "### ");
// // }

// // function dedupeTitles(topics: string[]): string[] {
// //   const seen = new Set<string>();
// //   const out: string[] = [];
// //   for (const topic of topics) {
// //     const key = topic.toLowerCase();
// //     if (!topic || seen.has(key)) continue;
// //     seen.add(key);
// //     out.push(topic);
// //   }
// //   return out;
// // }

// // async function generateForTopicChunk(
// //   numberedTopics: string[],
// //   apiKey: string,
// //   mode: string
// // ): Promise<string> {
// //   const basePrompt = buildGenerateContentChunkPrompt(numberedTopics);
// //   const modePrompt =
// //     mode === "techstack"
// //       ? `${basePrompt}\n\nAdditional requirements for tech-stack prep:\n- Go deeper with practical interview-ready detail.\n- Include common follow-up questions and edge cases.\n- Use concrete code or pseudo-code where it helps understanding.\n- Focus on junior-to-mid interview preparation depth.`
// //       : basePrompt;

// //   const content = await callOpenAI(
// //     [
// //       { role: "system", content: GENERATE_CONTENT_SYSTEM },
// //       { role: "user", content: modePrompt },
// //     ],
// //     { temperature: 0.2, max_tokens: 3200 },
// //     apiKey
// //   );

// //   return normalizeMarkdown(content || "");
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
// //     const rawTopics = body?.topics;
// //     const mode = typeof body?.mode === "string" ? body.mode : "";

// //     if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
// //       return NextResponse.json({ error: "Missing topics" }, { status: 400 });
// //     }

// //     const parsedTopics = rawTopics
// //       .map((topic: TopicInput) => ({
// //         title: topicToTitle(topic),
// //         tech: topicToTech(topic),
// //       }))
// //       .filter((topic) => topic.title.length > 0);

// //     if (!parsedTopics.length) {
// //       return NextResponse.json({ error: "No valid topics found" }, { status: 400 });
// //     }

// //     if (mode === "techstack") {
// //       const groupOrder: string[] = [];
// //       const grouped = new Map<string, string[]>();

// //       for (const topic of parsedTopics) {
// //         const tech = topic.tech || "General";
// //         if (!grouped.has(tech)) {
// //           grouped.set(tech, []);
// //           groupOrder.push(tech);
// //         }
// //         grouped.get(tech)?.push(topic.title);
// //       }

// //       const markdownSections: string[] = [];

// //       for (const tech of groupOrder) {
// //         const titles = dedupeTitles(grouped.get(tech) || []);
// //         if (!titles.length) continue;

// //         const chunkSize = titles.length > 12 ? 3 : 4;
// //         const chunks = chunkArray(titles, chunkSize);
// //         const techParts: string[] = [];
// //         let globalIndex = 1;

// //         for (const chunk of chunks) {
// //           const numbered = chunk.map((title) => `${globalIndex++}. ${title}`);
// //           const part = await generateForTopicChunk(numbered, apiKey, mode);
// //           if (part) {
// //             techParts.push(upliftTopicHeadings(part));
// //           }
// //         }

// //         if (techParts.length) {
// //           markdownSections.push(`## ${tech}\n\n${techParts.join("\n\n")}`);
// //         }
// //       }

// //       const finalMarkdown = normalizeMarkdown(markdownSections.join("\n\n"));
// //       return NextResponse.json({ markdown: finalMarkdown });
// //     }

// //     const topics = dedupeTitles(parsedTopics.map((topic) => topic.title));
// //     const chunkSize = topics.length > 10 ? 3 : 4;
// //     const topicChunks = chunkArray(topics, chunkSize);

// //     const parts: string[] = [];
// //     let globalIndex = 1;

// //     for (const chunk of topicChunks) {
// //       const numbered = chunk.map((title) => `${globalIndex++}. ${title}`);
// //       const part = await generateForTopicChunk(numbered, apiKey, mode);
// //       if (part) parts.push(part);
// //     }

// //     const finalMarkdown = normalizeMarkdown(parts.join("\n\n"));
// //     return NextResponse.json({ markdown: finalMarkdown });
// //   } catch (err: unknown) {
// //     const message = err instanceof Error ? err.message : "Server error";
// //     console.error("generate-content: unexpected error:", message);
// //     return NextResponse.json({ error: message }, { status: 500 });
// //   }
// // }


// import { NextResponse } from "next/server";
// import { callOpenAI } from "../../../src/lib/openai";
// import { GENERATE_CONTENT_SYSTEM } from "../../../src/lib/prompts";

// export const runtime = "nodejs";

// // ─── How many topics to process in parallel ───────────────────────────────────
// // Keep this at 5–8 to avoid rate limits while still being fast.
// const CONCURRENCY = 6;

// type TopicInput = string | Record<string, unknown>;

// function normalizeMarkdown(input: string): string {
//   let text = (input || "").replace(/\r\n/g, "\n").trim();
//   // Strip outer markdown fence if model wraps everything
//   const hasOuterFence =
//     /^```(?:markdown|md|text)?\s*\n/i.test(text) && /\n```$/.test(text);
//   if (hasOuterFence) {
//     text = text.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     text = text.replace(/\n```$/, "");
//   }
//   return text.replace(/\n{3,}/g, "\n\n").trim();
// }

// function topicToTitle(topic: TopicInput): string {
//   if (typeof topic === "string") return topic.trim();
//   if (topic && typeof topic === "object" && typeof topic.title === "string") {
//     return topic.title.trim();
//   }
//   return String(topic ?? "").trim();
// }

// function topicToTech(topic: TopicInput): string {
//   if (topic && typeof topic === "object" && typeof topic.tech === "string") {
//     return topic.tech.trim();
//   }
//   return "";
// }

// function dedupeTitles(topics: string[]): string[] {
//   const seen = new Set<string>();
//   return topics.filter((t) => {
//     const key = t.toLowerCase();
//     if (!t || seen.has(key)) return false;
//     seen.add(key);
//     return true;
//   });
// }

// // ─── Detect if a topic is a comparison (vs / difference / or) ─────────────────
// function isComparisonTopic(title: string): boolean {
//   const lower = title.toLowerCase();
//   return (
//     / vs\.? /i.test(lower) ||
//     /\bversus\b/i.test(lower) ||
//     /difference between/i.test(lower) ||
//     / or /i.test(lower) ||
//     /compared? (to|with)/i.test(lower) ||
//     /\bwhen to use\b/i.test(lower)
//   );
// }

// // ─── Prompt builder — one topic per call, adaptive ────────────────────────────
// function buildSingleTopicPrompt(topicTitle: string): string {
//   const isComparison = isComparisonTopic(topicTitle);

//   const comparisonExtra = isComparison
//     ? `\n⚠️ THIS IS A COMPARISON TOPIC. You MUST include a Markdown comparison table immediately after the intro.\n` +
//       `Table format:\n` +
//       `| Feature | [First Thing] | [Second Thing] |\n` +
//       `|---------|---------------|----------------|\n` +
//       `Cover 6–10 meaningful dimensions (e.g. Data model, Query language, Scalability, ACID compliance, Use case, Performance, Schema, etc.)\n` +
//       `After the table, continue with: When to use each → Key trade-offs → Real-world scenario → Interview talking points.\n`
//     : "";

//   return (
//     `Generate a comprehensive, interview-ready deep-dive for this topic:\n\n` +
//     `## ${topicTitle}\n` +
//     comparisonExtra +
//     `\nADAPTIVE STRUCTURE — pick the format that best fits this topic:\n` +
//     `- Conceptual (e.g. Event Loop, Closures): Definition → How it works → Internals/gotchas → Interview depth\n` +
//     `- Comparison (e.g. MongoDB vs PostgreSQL): Intro → Comparison TABLE → When to use each → Trade-offs → Talking points\n` +
//     `- Coding/Algorithm (e.g. Debounce, Memoization): Concept → Code example → Edge cases → Complexity\n` +
//     `- Architecture (e.g. Microservices, Caching): What/Why → Components → Trade-offs → When NOT to use\n` +
//     `- Language/Framework feature (e.g. React Hooks, Promises): Internal mechanics → Usage → Bugs → Best practices\n\n` +
//     `REQUIREMENTS:\n` +
//     `- Minimum 400 words of substantive, specific content\n` +
//     `- Include a code snippet if this is a coding/framework topic\n` +
//     `- Surface non-obvious insights that separate strong candidates\n` +
//     `- Never use the same subheading template as other topics — adapt to THIS topic\n` +
//     `- End with a "⚡ In an interview, say:" section with 2–3 punchy, specific bullets\n\n` +
//     `Return only Markdown starting with ## ${topicTitle}. No preamble, no outer code fence.`
//   ).trim();
// }

// // ─── Single topic generator ────────────────────────────────────────────────────
// async function generateForOneTopic(
//   topicTitle: string,
//   apiKey: string,
//   extraInstruction = ""
// ): Promise<string> {
//   const userPrompt = buildSingleTopicPrompt(topicTitle) +
//     (extraInstruction ? `\n\nExtra context: ${extraInstruction}` : "");

//   const content = await callOpenAI(
//     [
//       { role: "system", content: GENERATE_CONTENT_SYSTEM },
//       { role: "user", content: userPrompt },
//     ],
//     {
//       temperature: 0.3,
//       max_tokens: 1800, // ~1200–1500 words of real content per topic
//     },
//     apiKey
//   );

//   return normalizeMarkdown(content || "");
// }

// // ─── Parallel runner with concurrency cap ─────────────────────────────────────
// async function runWithConcurrency<T>(
//   tasks: (() => Promise<T>)[],
//   limit: number
// ): Promise<T[]> {
//   const results: T[] = new Array(tasks.length);
//   let index = 0;

//   async function worker() {
//     while (index < tasks.length) {
//       const i = index++;
//       results[i] = await tasks[i]();
//     }
//   }

//   const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
//   await Promise.all(workers);
//   return results;
// }

// // ─── Route handler ────────────────────────────────────────────────────────────
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
//     const rawTopics = body?.topics;
//     const mode = typeof body?.mode === "string" ? body.mode : "";

//     if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
//       return NextResponse.json({ error: "Missing topics" }, { status: 400 });
//     }

//     const parsedTopics = rawTopics
//       .map((topic: TopicInput) => ({
//         title: topicToTitle(topic),
//         tech: topicToTech(topic),
//       }))
//       .filter((topic) => topic.title.length > 0);

//     if (!parsedTopics.length) {
//       return NextResponse.json({ error: "No valid topics found" }, { status: 400 });
//     }

//     // ── TECH STACK MODE ──────────────────────────────────────────────────────
//     if (mode === "techstack") {
//       const groupOrder: string[] = [];
//       const grouped = new Map<string, string[]>();

//       for (const topic of parsedTopics) {
//         const tech = topic.tech || "General";
//         if (!grouped.has(tech)) {
//           grouped.set(tech, []);
//           groupOrder.push(tech);
//         }
//         grouped.get(tech)?.push(topic.title);
//       }

//       const markdownSections: string[] = [];

//       for (const tech of groupOrder) {
//         const titles = dedupeTitles(grouped.get(tech) || []);
//         if (!titles.length) continue;

//         const tasks = titles.map(
//           (title) => () =>
//             generateForOneTopic(
//               title,
//               apiKey,
//               `Tech context: ${tech}. Go deeper with practical interview-ready detail, common follow-ups, edge cases, and code where helpful.`
//             )
//         );

//         const parts = await runWithConcurrency(tasks, CONCURRENCY);
//         const validParts = parts.filter(Boolean);

//         if (validParts.length) {
//           markdownSections.push(`## ${tech}\n\n${validParts.join("\n\n")}`);
//         }
//       }

//       const finalMarkdown = normalizeMarkdown(markdownSections.join("\n\n"));
//       return NextResponse.json({ markdown: finalMarkdown });
//     }

//     // ── STANDARD DRILLDOWN MODE ───────────────────────────────────────────────
//     const topics = dedupeTitles(parsedTopics.map((t) => t.title));

//     // One API call per topic, run up to CONCURRENCY in parallel
//     const tasks = topics.map(
//       (title) => () => generateForOneTopic(title, apiKey)
//     );

//     const parts = await runWithConcurrency(tasks, CONCURRENCY);
//     const validParts = parts.filter(Boolean);

//     const finalMarkdown = normalizeMarkdown(validParts.join("\n\n"));
//     return NextResponse.json({ markdown: finalMarkdown });

//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     console.error("generate-content: unexpected error:", message);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { callOpenAI } from "../../../src/lib/openai";
import { GENERATE_CONTENT_SYSTEM } from "../../../src/lib/prompts";

export const runtime = "nodejs";

const CONCURRENCY = 6;

type TopicInput = string | Record<string, unknown>;

function normalizeMarkdown(input: string): string {
  let text = (input || "").replace(/\r\n/g, "\n").trim();
  const hasOuterFence =
    /^```(?:markdown|md|text)?\s*\n/i.test(text) && /\n```$/.test(text);
  if (hasOuterFence) {
    text = text.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    text = text.replace(/\n```$/, "");
  }
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function topicToTitle(topic: TopicInput): string {
  if (typeof topic === "string") return topic.trim();
  if (topic && typeof topic === "object" && typeof topic.title === "string") {
    return topic.title.trim();
  }
  return String(topic ?? "").trim();
}

function topicToTech(topic: TopicInput): string {
  if (topic && typeof topic === "object" && typeof topic.tech === "string") {
    return topic.tech.trim();
  }
  return "";
}

function dedupeTitles(topics: string[]): string[] {
  const seen = new Set<string>();
  return topics.filter((t) => {
    const key = t.toLowerCase();
    if (!t || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function generateForOneTopic(
  topicTitle: string,
  apiKey: string,
  techContext = ""
): Promise<string> {
  const userPrompt = (
    `Generate the quick-reference section for this topic:\n\n` +
    `## ${topicTitle}\n\n` +
    (techContext ? `Tech context: ${techContext}\n\n` : "") +
    `Follow the system prompt structure exactly.\n` +
    `Return only Markdown starting with ## ${topicTitle}. No preamble.`
  ).trim();

  const content = await callOpenAI(
    [
      { role: "system", content: GENERATE_CONTENT_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    {
      temperature: 0.3,
      max_tokens: 1000,
    },
    apiKey
  );

  return normalizeMarkdown(content || "");
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
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
    const rawTopics = body?.topics;
    const mode = typeof body?.mode === "string" ? body.mode : "";

    if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
      return NextResponse.json({ error: "Missing topics" }, { status: 400 });
    }

    const parsedTopics = rawTopics
      .map((topic: TopicInput) => ({
        title: topicToTitle(topic),
        tech: topicToTech(topic),
      }))
      .filter((topic) => topic.title.length > 0);

    if (!parsedTopics.length) {
      return NextResponse.json({ error: "No valid topics found" }, { status: 400 });
    }

    // ── TECH STACK MODE ──────────────────────────────────────────────────────
    if (mode === "techstack") {
      const groupOrder: string[] = [];
      const grouped = new Map<string, string[]>();

      for (const topic of parsedTopics) {
        const tech = topic.tech || "General";
        if (!grouped.has(tech)) {
          grouped.set(tech, []);
          groupOrder.push(tech);
        }
        grouped.get(tech)?.push(topic.title);
      }

      const markdownSections: string[] = [];

      for (const tech of groupOrder) {
        const titles = dedupeTitles(grouped.get(tech) || []);
        if (!titles.length) continue;

        const tasks = titles.map(
          (title) => () => generateForOneTopic(title, apiKey, tech)
        );

        const parts = await runWithConcurrency(tasks, CONCURRENCY);
        const validParts = parts.filter(Boolean);

        if (validParts.length) {
          // ## Tech as heading, ### Topic as toggles inside
          const topicSections = validParts.map((part) =>
            part.replace(/^## /m, "### ")
          );
          markdownSections.push(`## ${tech}\n\n${topicSections.join("\n\n")}`);
        }
      }

      const finalMarkdown = normalizeMarkdown(markdownSections.join("\n\n"));
      return NextResponse.json({ markdown: finalMarkdown });
    }

    // ── STANDARD DRILLDOWN MODE ───────────────────────────────────────────────
    const topics = dedupeTitles(parsedTopics.map((t) => t.title));

    const tasks = topics.map(
      (title) => () => generateForOneTopic(title, apiKey)
    );

    const parts = await runWithConcurrency(tasks, CONCURRENCY);
    const validParts = parts.filter(Boolean);

    const finalMarkdown = normalizeMarkdown(validParts.join("\n\n"));
    return NextResponse.json({ markdown: finalMarkdown });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("generate-content: unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
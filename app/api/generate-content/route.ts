import { NextResponse } from "next/server";
import { callOpenAI } from "../../../src/lib/openai";

export const runtime = "nodejs";

function chunkArray<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function normalizeMarkdown(input: string) {
  let text = (input || "").replace(/\r\n/g, "\n").trim();
  const hasOuterFence =
    /^```(?:markdown|md|text)?\s*\n/i.test(text) && /\n```$/.test(text);

  if (hasOuterFence) {
    text = text.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    text = text.replace(/\n```$/, "");
  }

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function topicToTitle(topic: unknown) {
  if (typeof topic === "string") return topic.trim();
  if (
    topic &&
    typeof topic === "object" &&
    "title" in topic &&
    typeof (topic as { title?: unknown }).title === "string"
  ) {
    return (topic as { title: string }).title.trim();
  }
  return String(topic ?? "").trim();
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

    if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
      return NextResponse.json({ error: "Missing topics" }, { status: 400 });
    }

    const topics = rawTopics.map(topicToTitle).filter(Boolean);

    if (!topics.length) {
      return NextResponse.json({ error: "No valid topics found" }, { status: 400 });
    }

    const baseInstruction = `
You are an interview preparation assistant.

Return MARKDOWN only.
Use headings, subheadings, bold text, bullet lists, numbered lists, and fenced code blocks.
Do NOT wrap the entire response in one giant code block.

For EACH topic, follow this exact structure:
## <topic number>. <topic name>
### Overview
(2-4 lines)
### Core Concepts
- concise bullet points
### Step-by-Step Explanation
1. ordered steps
### Examples
- practical examples
- include fenced code blocks with language when needed
### Common Mistakes and Best Practices
- mistakes
- best practices
### Quick Recap
- short bullets

Rules:
- Keep depth consistent for every topic.
- Do not include a document-wide introduction or conclusion.
- Keep explanations clear and interview-focused.
`.trim();

    const chunkSize = topics.length > 10 ? 3 : 4;
    const topicChunks = chunkArray(topics, chunkSize);

    const parts: string[] = [];
    let globalIndex = 1;

    for (let i = 0; i < topicChunks.length; i++) {
      const chunk = topicChunks[i];
      const numbered = chunk.map((title) => `${globalIndex++}. ${title}`);

      const prompt = `
${baseInstruction}

Generate content ONLY for the topics below, in the same order:
${numbered.join("\n")}
`.trim();

      const content = await callOpenAI(
        [
          {
            role: "system",
            content:
              "Return Markdown only. Use headings, subheadings, bold text, bullet lists, numbered lists, and fenced code blocks.",
          },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2 },
        apiKey
      );

      parts.push(normalizeMarkdown(content || ""));
    }

    const finalMarkdown = normalizeMarkdown(parts.join("\n\n"));
    return NextResponse.json({ markdown: finalMarkdown });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

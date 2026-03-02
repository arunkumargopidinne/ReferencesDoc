import { NextResponse } from "next/server";
import { callOpenAI } from "../../../src/lib/openai";
import { createNotionPage } from "../../../src/lib/notion";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const notionToken =
      process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";

    if (!notionToken) {
      return NextResponse.json(
        { error: "Server misconfiguration: NOTION_TOKEN is not set" },
        { status: 500 }
      );
    }

    // ---- Parse body ----
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { companyName, techStack } = body || {};
    if (!techStack) {
      return NextResponse.json({ error: "Missing techStack" }, { status: 400 });
    }

    // ---- Prompt: old-style clarity ----
    const system =
      "You are an assistant that extracts interview topics from a given tech stack.";

    // We ask for SIMPLE JSON: { topics: [{id,title,section}] }
    // This keeps output consistent and “clear”.
    const user =
      `Company: ${companyName || ""}\n` +
      `Tech stack: ${techStack}\n\n` +
      `Task:\n` +
      `1) List the MOST LIKELY interview topics based strictly on the tech stack.\n` +
      `2) Add closely related fundamentals/intermediate topics.\n\n` +
      `Rules:\n` +
      `- Return STRICT JSON ONLY (no markdown, no explanation)\n` +
      `- Titles must be short (2-6 words)\n` +
      `- No duplicates\n\n` +
      `Return format:\n` +
      `{\n` +
      `  "topics": [\n` +
      `    { "id": "string", "title": "string", "section": "asked" | "additional" }\n` +
      `  ]\n` +
      `}\n\n` +
      `Guidance:\n` +
      `- section="asked": core topics directly implied by the tech stack\n` +
      `- section="additional": closely related fundamentals/intermediate topics\n`;

    // ---- API Key ----
    let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // Optional local dev fallback: read .env.local
    if (!apiKey) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const p = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(p)) {
          const txt = fs.readFileSync(p, "utf8");
          const m = txt.match(/OPENAI_API_KEY\s*=\s*(\S+)/);
          if (m) apiKey = m[1];
        }
      } catch {
        // ignore
      }
    }

    // ---- Call OpenAI ----
    let content: string | undefined;
    try {
      content = await callOpenAI(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { temperature: 0 },
        apiKey
      );
    } catch (e: any) {
      const msg = e?.message || "OpenAI request failed";
      console.error("generate-techstack: OpenAI error:", msg);
      return NextResponse.json({ error: "OpenAI error: " + msg }, { status: 502 });
    }

    // ---- Parse JSON (robust) ----
    let parsed: any = null;
    try {
      parsed = JSON.parse(content || "{}");
    } catch {
      const m = (content || "").match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    const topicsRaw = parsed?.topics || [];
    const topics = Array.isArray(topicsRaw)
      ? topicsRaw.map((t: any) => ({
          id: t?.id || uuidv4(),
          title: t?.title ? String(t.title) : String(t),
          section: t?.section === "asked" || t?.section === "additional" ? t.section : "asked",
        }))
      : [];

    // ---- Build Notion markdown ----
    const asked = topics.filter((t: any) => t.section === "asked");
    const additional = topics.filter((t: any) => t.section === "additional");

    const title = `${companyName ? companyName + " - " : ""}Tech Stack Interview Topics`;

    const markdown =
      `# ${title}\n\n` +
      `**Tech Stack:** ${techStack}\n\n` +
      `## Core Topics (from Tech Stack)\n` +
      (asked.length ? asked.map((t: any) => `- ${t.title}`).join("\n") : "- (none)") +
      `\n\n## Additional Related Topics\n` +
      (additional.length
        ? additional.map((t: any) => `- ${t.title}`).join("\n")
        : "- (none)") +
      `\n`;

    // ---- Create Notion page ----
    const notionRes = await createNotionPage(title, markdown);

    const fallbackUrl = `https://www.notion.so/${notionRes?.id?.replace(/-/g, "")}`;
    const url = notionRes?.url || fallbackUrl;
    const publicUrl = notionRes?.public_url || "";
    const preferredUrl = publicUrl || url;

    return NextResponse.json({
      preferredUrl,
      url,
      publicUrl,
      id: notionRes?.id || "",
      topics,
    });
  } catch (err: any) {
    const message = err?.message || "Server error";
    console.error("generate-techstack: unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import { callOpenAI } from "../../../src/lib/openai";
// import {
//   GENERATE_TECHSTACK_SYSTEM,
//   buildGenerateTechstackUserPrompt,
// } from "../../../src/lib/prompts";

// type TopicSection = "asked" | "additional";
// type TopicLevel = "basic" | "intermediate";

// type Topic = {
//   id: string;
//   title: string;
//   section: TopicSection;
//   tech: string;
//   level: TopicLevel;
// };

// const MIN_TOPICS_PER_TECH = 10;

// function safeParseJson(input: string): unknown | null {
//   try {
//     return JSON.parse(input);
//   } catch {
//     return null;
//   }
// }

// function stripMarkdownCodeFences(input: string): string {
//   const match = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
//   return match?.[1]?.trim() || input.trim();
// }

// function extractFirstJsonObject(input: string): string | null {
//   let start = -1;
//   let depth = 0;
//   let inString = false;
//   let escaped = false;

//   for (let i = 0; i < input.length; i += 1) {
//     const ch = input[i];

//     if (start === -1) {
//       if (ch === "{") {
//         start = i;
//         depth = 1;
//       }
//       continue;
//     }

//     if (inString) {
//       if (escaped) {
//         escaped = false;
//         continue;
//       }
//       if (ch === "\\") {
//         escaped = true;
//         continue;
//       }
//       if (ch === "\"") {
//         inString = false;
//       }
//       continue;
//     }

//     if (ch === "\"") {
//       inString = true;
//       continue;
//     }

//     if (ch === "{") depth += 1;
//     if (ch === "}") depth -= 1;

//     if (depth === 0) {
//       return input.slice(start, i + 1);
//     }
//   }

//   return null;
// }

// function repairCommonJsonIssues(input: string): string {
//   return input
//     .replace(/[\u201C\u201D]/g, "\"")
//     .replace(/[\u2018\u2019]/g, "'")
//     .replace(/,\s*([}\]])/g, "$1")
//     .trim();
// }

// function parseModelJsonObject(content: string | undefined): Record<string, unknown> | null {
//   if (!content) return null;

//   const normalized = stripMarkdownCodeFences(content);
//   const extracted = extractFirstJsonObject(normalized);
//   const candidates = [normalized, extracted].filter((v): v is string => Boolean(v));

//   for (const candidate of candidates) {
//     const direct = safeParseJson(candidate);
//     if (direct && typeof direct === "object" && !Array.isArray(direct)) {
//       return direct as Record<string, unknown>;
//     }

//     const repaired = repairCommonJsonIssues(candidate);
//     const repairedParsed = safeParseJson(repaired);
//     if (
//       repairedParsed &&
//       typeof repairedParsed === "object" &&
//       !Array.isArray(repairedParsed)
//     ) {
//       return repairedParsed as Record<string, unknown>;
//     }
//   }

//   return null;
// }

// function extractTopicsFromPartialModelJson(content: string | undefined): unknown[] {
//   if (!content) return [];

//   const normalized = repairCommonJsonIssues(stripMarkdownCodeFences(content));
//   const topicsKeyIndex = normalized.search(/"topics"\s*:/i);
//   if (topicsKeyIndex === -1) return [];

//   const arrayStart = normalized.indexOf("[", topicsKeyIndex);
//   if (arrayStart === -1) return [];

//   const extracted: unknown[] = [];
//   let objStart = -1;
//   let depth = 0;
//   let inString = false;
//   let escaped = false;

//   for (let i = arrayStart + 1; i < normalized.length; i += 1) {
//     const ch = normalized[i];

//     if (inString) {
//       if (escaped) {
//         escaped = false;
//         continue;
//       }
//       if (ch === "\\") {
//         escaped = true;
//         continue;
//       }
//       if (ch === "\"") {
//         inString = false;
//       }
//       continue;
//     }

//     if (ch === "\"") {
//       inString = true;
//       continue;
//     }

//     if (ch === "{") {
//       if (depth === 0) objStart = i;
//       depth += 1;
//       continue;
//     }

//     if (ch === "}") {
//       if (depth > 0) depth -= 1;
//       if (depth === 0 && objStart !== -1) {
//         const candidate = normalized.slice(objStart, i + 1);
//         const parsed = safeParseJson(candidate);
//         if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
//           extracted.push(parsed);
//         }
//         objStart = -1;
//       }
//       continue;
//     }

//     if (ch === "]" && depth === 0) {
//       break;
//     }
//   }

//   return extracted;
// }

// function getStringProp(obj: unknown, key: string): string {
//   if (!obj || typeof obj !== "object") return "";
//   const value = (obj as Record<string, unknown>)[key];
//   return typeof value === "string" ? value : "";
// }

// function getRecordProp(obj: unknown, key: string): unknown {
//   if (!obj || typeof obj !== "object") return undefined;
//   return (obj as Record<string, unknown>)[key];
// }

// function normalizeTechName(name: string): string {
//   return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
// }

// function dedupeStrings(values: string[]): string[] {
//   const seen = new Set<string>();
//   const out: string[] = [];
//   for (const value of values) {
//     const trimmed = value.trim();
//     if (!trimmed) continue;
//     const key = normalizeTechName(trimmed);
//     if (!key || seen.has(key)) continue;
//     seen.add(key);
//     out.push(trimmed);
//   }
//   return out;
// }

// function parseTechStackInput(input: string): string[] {
//   return dedupeStrings(
//     input
//       .split(/[,/|;\n]+/)
//       .map((entry) => entry.trim())
//       .filter(Boolean)
//   );
// }

// function expandTechAliases(techs: string[]): string[] {
//   const aliasMap: Record<string, string[]> = {
//     mern: ["MongoDB", "Express.js", "React", "Node.js"],
//     mean: ["MongoDB", "Express.js", "Angular", "Node.js"],
//     lamp: ["Linux", "Apache", "MySQL", "PHP"],
//     jamstack: ["JavaScript", "APIs", "Markup"],
//   };

//   const expanded: string[] = [];
//   for (const tech of techs) {
//     const key = normalizeTechName(tech);
//     if (aliasMap[key]) {
//       expanded.push(...aliasMap[key]);
//     } else {
//       expanded.push(tech);
//     }
//   }
//   return dedupeStrings(expanded);
// }

// function isFundamentalsTech(tech: string): boolean {
//   const key = normalizeTechName(tech);
//   return (
//     key === "fundamentals" ||
//     key === "additional" ||
//     key === "crosscutting" ||
//     key === "general"
//   );
// }

// function normalizeTopic(raw: unknown, fallbackTech: string): Topic {
//   if (raw && typeof raw === "object") {
//     const item = raw as Record<string, unknown>;
//     const id = getStringProp(item, "id") || uuidv4();
//     const titleValue = getRecordProp(item, "title");
//     const title = typeof titleValue === "string" ? titleValue.trim() : String(titleValue ?? "").trim();

//     const sectionValue = getRecordProp(item, "section");
//     const section: TopicSection =
//       sectionValue === "asked" || sectionValue === "additional" ? sectionValue : "asked";

//     const levelValue = getRecordProp(item, "level");
//     const level: TopicLevel = levelValue === "intermediate" ? "intermediate" : "basic";

//     const techValue = getRecordProp(item, "tech");
//     const tech =
//       typeof techValue === "string" && techValue.trim()
//         ? techValue.trim()
//         : section === "additional"
//         ? "Fundamentals"
//         : fallbackTech;

//     return { id, title, section, tech, level };
//   }

//   return {
//     id: uuidv4(),
//     title: String(raw ?? "").trim(),
//     section: "asked",
//     tech: fallbackTech,
//     level: "basic",
//   };
// }

// function dedupeTopics(topics: Topic[]): Topic[] {
//   const seen = new Set<string>();
//   const out: Topic[] = [];

//   for (const topic of topics) {
//     const key = `${normalizeTechName(topic.tech)}::${topic.title.toLowerCase()}`;
//     if (!topic.title || seen.has(key)) continue;
//     seen.add(key);
//     out.push(topic);
//   }

//   return out;
// }

// function countAskedTopicsForTech(topics: Topic[], tech: string): number {
//   const techKey = normalizeTechName(tech);
//   return topics.filter((topic) => {
//     if (topic.section !== "asked") return false;
//     if (isFundamentalsTech(topic.tech)) return false;
//     return normalizeTechName(topic.tech) === techKey;
//   }).length;
// }

// function buildTechTopUpPrompt(
//   companyName: string,
//   missing: Array<{ tech: string; needed: number }>
// ): string {
//   const list = missing
//     .map((entry) => `- ${entry.tech}: ${entry.needed} more topics`)
//     .join("\n");

//   return (
//     `Company: ${companyName || "Not specified"}\n\n` +
//     `Generate additional interview topics only for the technologies below.\n` +
//     `Return STRICT JSON only in this shape:\n` +
//     `{\n` +
//     `  "topics": [\n` +
//     `    {\n` +
//     `      "id": "unique-kebab-case-slug",\n` +
//     `      "title": "Specific interview topic title",\n` +
//     `      "section": "asked",\n` +
//     `      "tech": "Exact technology name from the request",\n` +
//     `      "level": "basic" | "intermediate"\n` +
//     `    }\n` +
//     `  ]\n` +
//     `}\n\n` +
//     `Rules:\n` +
//     `- Generate exactly the requested amount per technology.\n` +
//     `- No duplicate titles.\n` +
//     `- No markdown, no explanation, no code fences.\n\n` +
//     `Needs:\n${list}`
//   );
// }

// async function callModelForTopics(
//   system: string,
//   user: string,
//   apiKey: string | undefined,
//   maxTokens: number
// ): Promise<unknown[]> {
//   const content = await callOpenAI(
//     [
//       { role: "system", content: system },
//       { role: "user", content: user },
//     ],
//     { temperature: 0, max_tokens: maxTokens },
//     apiKey
//   );

//   const parsed = parseModelJsonObject(content);
//   const fromParsed = parsed?.topics;
//   if (Array.isArray(fromParsed)) return fromParsed;
//   return extractTopicsFromPartialModelJson(content);
// }

// export async function POST(req: Request) {
//   try {
//     let body: unknown;
//     try {
//       body = await req.json();
//     } catch {
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//     }

//     const bodyObj = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
//     const companyName = getStringProp(bodyObj, "companyName");
//     const techStackInput = getStringProp(bodyObj, "techStack");

//     if (!techStackInput) {
//       return NextResponse.json({ error: "Missing techStack" }, { status: 400 });
//     }

//     let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//     if (!apiKey) {
//       try {
//         const fs = await import("fs");
//         const path = await import("path");
//         const p = path.resolve(process.cwd(), ".env.local");
//         if (fs.existsSync(p)) {
//           const txt = fs.readFileSync(p, "utf8");
//           const m = txt.match(/OPENAI_API_KEY\s*=\s*(\S+)/);
//           if (m) apiKey = m[1];
//         }
//       } catch {
//         // ignore
//       }
//     }

//     const parsedTechs = parseTechStackInput(techStackInput);
//     const requestedTechs = expandTechAliases(parsedTechs);
//     const techStackForPrompt = requestedTechs.length
//       ? requestedTechs.join(", ")
//       : techStackInput;

//     const initialRawTopics = await callModelForTopics(
//       GENERATE_TECHSTACK_SYSTEM,
//       buildGenerateTechstackUserPrompt(companyName, techStackForPrompt),
//       apiKey,
//       6000
//     );

//     if (!initialRawTopics.length) {
//       return NextResponse.json(
//         { error: "Model returned invalid JSON for tech stack topics. Please retry." },
//         { status: 502 }
//       );
//     }

//     const fallbackTech = requestedTechs[0] || "General";
//     let topics = dedupeTopics(
//       initialRawTopics
//         .map((raw) => normalizeTopic(raw, fallbackTech))
//         .filter((topic) => topic.title.length > 0)
//     );

//     if (!topics.length) {
//       return NextResponse.json(
//         { error: "Model response did not contain valid topics. Please retry." },
//         { status: 502 }
//       );
//     }

//     if (requestedTechs.length) {
//       const missing = requestedTechs
//         .map((tech) => {
//           const count = countAskedTopicsForTech(topics, tech);
//           return { tech, needed: Math.max(0, MIN_TOPICS_PER_TECH - count) };
//         })
//         .filter((entry) => entry.needed > 0);

//       if (missing.length > 0) {
//         try {
//           const topupRawTopics = await callModelForTopics(
//             GENERATE_TECHSTACK_SYSTEM,
//             buildTechTopUpPrompt(companyName, missing),
//             apiKey,
//             3500
//           );

//           if (topupRawTopics.length > 0) {
//             const topupTopics = topupRawTopics
//               .map((raw) => normalizeTopic(raw, fallbackTech))
//               .filter((topic) => topic.title.length > 0);
//             topics = dedupeTopics([...topics, ...topupTopics]);
//           }
//         } catch (error: unknown) {
//           const message = error instanceof Error ? error.message : "top-up generation failed";
//           console.warn("generate-techstack: top-up warning:", message);
//         }
//       }
//     }

//     const countsByTech = requestedTechs.map((tech) => ({
//       tech,
//       count: countAskedTopicsForTech(topics, tech),
//     }));

//     return NextResponse.json({
//       topics,
//       requestedTechs,
//       countsByTech,
//     });
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Server error";
//     console.error("generate-techstack: unexpected error:", message);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { callOpenAI } from "../../../src/lib/openai";
import {
  GENERATE_TECHSTACK_SYSTEM,
  buildGenerateTechstackUserPrompt,
} from "../../../src/lib/prompts";

type TopicSection = "asked" | "additional";
type TopicLevel = "basic" | "intermediate";

type Topic = {
  id: string;
  title: string;
  section: TopicSection;
  tech: string;
  level: TopicLevel;
};

const MIN_TOPICS_PER_TECH = 20;

function safeParseJson(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function stripMarkdownCodeFences(input: string): string {
  const match = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() || input.trim();
}

function extractFirstJsonObject(input: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (start === -1) {
      if (ch === "{") {
        start = i;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === "\"") inString = false;
      continue;
    }

    if (ch === "\"") { inString = true; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) return input.slice(start, i + 1);
  }

  return null;
}

function repairCommonJsonIssues(input: string): string {
  return input
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

function parseModelJsonObject(content: string | undefined): Record<string, unknown> | null {
  if (!content) return null;

  const normalized = stripMarkdownCodeFences(content);
  const extracted = extractFirstJsonObject(normalized);
  const candidates = [normalized, extracted].filter((v): v is string => Boolean(v));

  for (const candidate of candidates) {
    const direct = safeParseJson(candidate);
    if (direct && typeof direct === "object" && !Array.isArray(direct)) {
      return direct as Record<string, unknown>;
    }

    const repaired = repairCommonJsonIssues(candidate);
    const repairedParsed = safeParseJson(repaired);
    if (repairedParsed && typeof repairedParsed === "object" && !Array.isArray(repairedParsed)) {
      return repairedParsed as Record<string, unknown>;
    }
  }

  return null;
}

function extractTopicsFromPartialModelJson(content: string | undefined): unknown[] {
  if (!content) return [];

  const normalized = repairCommonJsonIssues(stripMarkdownCodeFences(content));
  const topicsKeyIndex = normalized.search(/"topics"\s*:/i);
  if (topicsKeyIndex === -1) return [];

  const arrayStart = normalized.indexOf("[", topicsKeyIndex);
  if (arrayStart === -1) return [];

  const extracted: unknown[] = [];
  let objStart = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = arrayStart + 1; i < normalized.length; i += 1) {
    const ch = normalized[i];

    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === "\"") inString = false;
      continue;
    }

    if (ch === "\"") { inString = true; continue; }
    if (ch === "{") {
      if (depth === 0) objStart = i;
      depth += 1;
      continue;
    }

    if (ch === "}") {
      if (depth > 0) depth -= 1;
      if (depth === 0 && objStart !== -1) {
        const candidate = normalized.slice(objStart, i + 1);
        const parsed = safeParseJson(candidate);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          extracted.push(parsed);
        }
        objStart = -1;
      }
      continue;
    }

    if (ch === "]" && depth === 0) break;
  }

  return extracted;
}

function getStringProp(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function getRecordProp(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return (obj as Record<string, unknown>)[key];
}

function normalizeTechName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeTechName(trimmed);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function parseTechStackInput(input: string): string[] {
  return dedupeStrings(
    input
      .split(/[,/|;\n]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

function expandTechAliases(techs: string[]): string[] {
  const aliasMap: Record<string, string[]> = {
    mern: ["MongoDB", "Express.js", "React", "Node.js"],
    mean: ["MongoDB", "Express.js", "Angular", "Node.js"],
    lamp: ["Linux", "Apache", "MySQL", "PHP"],
    jamstack: ["JavaScript", "APIs", "Markup"],
  };

  const expanded: string[] = [];
  for (const tech of techs) {
    const key = normalizeTechName(tech);
    if (aliasMap[key]) {
      expanded.push(...aliasMap[key]);
    } else {
      expanded.push(tech);
    }
  }
  return dedupeStrings(expanded);
}

function isFundamentalsTech(tech: string): boolean {
  const key = normalizeTechName(tech);
  return (
    key === "fundamentals" ||
    key === "additional" ||
    key === "crosscutting" ||
    key === "general"
  );
}

function normalizeTopic(raw: unknown, fallbackTech: string): Topic {
  if (raw && typeof raw === "object") {
    const item = raw as Record<string, unknown>;
    const id = getStringProp(item, "id") || uuidv4();
    const titleValue = getRecordProp(item, "title");
    const title = typeof titleValue === "string" ? titleValue.trim() : String(titleValue ?? "").trim();

    const sectionValue = getRecordProp(item, "section");
    const section: TopicSection =
      sectionValue === "asked" || sectionValue === "additional" ? sectionValue : "asked";

    const levelValue = getRecordProp(item, "level");
    const level: TopicLevel = levelValue === "intermediate" ? "intermediate" : "basic";

    const techValue = getRecordProp(item, "tech");
    const tech =
      typeof techValue === "string" && techValue.trim()
        ? techValue.trim()
        : section === "additional"
        ? "Fundamentals"
        : fallbackTech;

    return { id, title, section, tech, level };
  }

  return {
    id: uuidv4(),
    title: String(raw ?? "").trim(),
    section: "asked",
    tech: fallbackTech,
    level: "basic",
  };
}

function dedupeTopics(topics: Topic[]): Topic[] {
  const seen = new Set<string>();
  const out: Topic[] = [];

  for (const topic of topics) {
    const key = `${normalizeTechName(topic.tech)}::${topic.title.toLowerCase()}`;
    if (!topic.title || seen.has(key)) continue;
    seen.add(key);
    out.push(topic);
  }

  return out;
}

function countAskedTopicsForTech(topics: Topic[], tech: string): number {
  const techKey = normalizeTechName(tech);
  return topics.filter((topic) => {
    if (topic.section !== "asked") return false;
    if (isFundamentalsTech(topic.tech)) return false;
    return normalizeTechName(topic.tech) === techKey;
  }).length;
}

function buildTechTopUpPrompt(
  companyName: string,
  missing: Array<{ tech: string; needed: number }>
): string {
  const list = missing
    .map((entry) => `- ${entry.tech}: ${entry.needed} more topics`)
    .join("\n");

  return (
    `Company: ${companyName || "Not specified"}\n\n` +
    `Generate additional interview topics only for the technologies below.\n` +
    `Return STRICT JSON only in this shape:\n` +
    `{\n` +
    `  "topics": [\n` +
    `    {\n` +
    `      "id": "unique-kebab-case-slug",\n` +
    `      "title": "Specific interview topic title",\n` +
    `      "section": "asked",\n` +
    `      "tech": "Exact technology name from the request",\n` +
    `      "level": "basic" | "intermediate"\n` +
    `    }\n` +
    `  ]\n` +
    `}\n\n` +
    `Rules:\n` +
    `- Generate exactly the requested amount per technology.\n` +
    `- No duplicate titles.\n` +
    `- No markdown, no explanation, no code fences.\n\n` +
    `Needs:\n${list}`
  );
}

async function callModelForTopics(
  system: string,
  user: string,
  apiKey: string | undefined,
  maxTokens: number
): Promise<unknown[]> {
  const content = await callOpenAI(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0, max_tokens: maxTokens },
    apiKey
  );

  const parsed = parseModelJsonObject(content);
  const fromParsed = parsed?.topics;
  if (Array.isArray(fromParsed)) return fromParsed;
  return extractTopicsFromPartialModelJson(content);
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const bodyObj = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const companyName = getStringProp(bodyObj, "companyName");
    const techStackInput = getStringProp(bodyObj, "techStack");

    if (!techStackInput) {
      return NextResponse.json({ error: "Missing techStack" }, { status: 400 });
    }

    let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
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

    const parsedTechs = parseTechStackInput(techStackInput);
    const requestedTechs = expandTechAliases(parsedTechs);
    const techStackForPrompt = requestedTechs.length
      ? requestedTechs.join(", ")
      : techStackInput;

    const initialRawTopics = await callModelForTopics(
      GENERATE_TECHSTACK_SYSTEM,
      buildGenerateTechstackUserPrompt(companyName, techStackForPrompt),
      apiKey,
      8000
    );

    if (!initialRawTopics.length) {
      return NextResponse.json(
        { error: "Model returned invalid JSON for tech stack topics. Please retry." },
        { status: 502 }
      );
    }

    const fallbackTech = requestedTechs[0] || "General";
    let topics = dedupeTopics(
      initialRawTopics
        .map((raw) => normalizeTopic(raw, fallbackTech))
        .filter((topic) => topic.title.length > 0)
    );

    if (!topics.length) {
      return NextResponse.json(
        { error: "Model response did not contain valid topics. Please retry." },
        { status: 502 }
      );
    }

    if (requestedTechs.length) {
      const missing = requestedTechs
        .map((tech) => {
          const count = countAskedTopicsForTech(topics, tech);
          return { tech, needed: Math.max(0, MIN_TOPICS_PER_TECH - count) };
        })
        .filter((entry) => entry.needed > 0);

      if (missing.length > 0) {
        try {
          const topupRawTopics = await callModelForTopics(
            GENERATE_TECHSTACK_SYSTEM,
            buildTechTopUpPrompt(companyName, missing),
            apiKey,
            5000
          );

          if (topupRawTopics.length > 0) {
            const topupTopics = topupRawTopics
              .map((raw) => normalizeTopic(raw, fallbackTech))
              .filter((topic) => topic.title.length > 0);
            topics = dedupeTopics([...topics, ...topupTopics]);
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "top-up generation failed";
          console.warn("generate-techstack: top-up warning:", message);
        }
      }
    }

    const countsByTech = requestedTechs.map((tech) => ({
      tech,
      count: countAskedTopicsForTech(topics, tech),
    }));

    return NextResponse.json({
      topics,
      requestedTechs,
      countsByTech,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("generate-techstack: unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
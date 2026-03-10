// // import { NextResponse } from 'next/server';
// // import { callOpenAI } from '../../../src/lib/openai';
// // import { v4 as uuidv4 } from 'uuid';

// // export async function POST(req: Request) {
// //   try {
// //     // Defer OPENAI_API_KEY validation to `callOpenAI` which will attempt
// //     // to load `.env.local` at runtime in local development.
// //     let body: any;
// //     try {
// //       body = await req.json();
// //     } catch (e) {
// //       return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
// //     }
// //     const { companyName, jobDescription, techStack } = body || {};
// //     if (!jobDescription) return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });

// //     const system = `You are an assistant that extracts interview topics from job descriptions or interview questions.`;
// //     const user = `Company: ${companyName}\nTech stack: ${techStack}\nDescription:\n${jobDescription}\n\nReturn a JSON array named \"topics\". Each topic is {\"id\":string, \"title\":string}. Keep output strictly as JSON.`;

// //     let content: string | undefined;
// //     try {
// //       // Try to obtain an API key: prefer process.env, otherwise read .env.local directly
// //       let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
// //       if (!apiKey) {
// //         try {
// //           const fs = await import('fs');
// //           const path = await import('path');
// //           const p = path.resolve(process.cwd(), '.env.local');
// //           if (fs.existsSync(p)) {
// //             const txt = fs.readFileSync(p, 'utf8');
// //             const m = txt.match(/OPENAI_API_KEY\s*=\s*(\S+)/);
// //             if (m) apiKey = m[1];
// //           }
// //         } catch (e) {
// //           // ignore
// //         }
// //       }

// //       content = await callOpenAI([
// //         { role: 'system', content: system },
// //         { role: 'user', content: user },
// //       ], { temperature: 0 }, apiKey);
// //     } catch (e: any) {
// //       const msg = e?.message || 'OpenAI request failed';
// //       console.error('extract-topics: OpenAI error:', msg);
// //       return NextResponse.json({ error: 'OpenAI error: ' + msg }, { status: 502 });
// //     }

// //     // Try to parse JSON from the model output
// //     let parsed: any = null;
// //     try {
// //       parsed = JSON.parse(content || '{}');
// //     } catch (e) {
// //       // attempt to extract JSON substring
// //       const m = (content || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
// //       if (m) parsed = JSON.parse(m[0]);
// //     }

// //     const topicsRaw = parsed?.topics || parsed || [];
// //     const topics = Array.isArray(topicsRaw) ? topicsRaw.map((t: any)=> ({ id: t.id || uuidv4(), title: t.title || String(t) })) : [];

// //     return NextResponse.json({ topics });
// //   } catch (err: any) {
// //     // Return useful error info for local dev (do not leak secrets)
// //     const message = err?.message || 'Server error';
// //     console.error('extract-topics: unexpected error:', message);
// //     return NextResponse.json({ error: message }, { status: 500 });
// //   }
// // }
// import { NextResponse } from 'next/server';
// import { callOpenAI } from '../../../src/lib/openai';
// import { EXTRACT_TOPICS_SYSTEM, buildExtractTopicsUserPrompt } from '../../../src/lib/prompts';
// import { v4 as uuidv4 } from 'uuid';

// export async function POST(req: Request) {
//   try {
//     // Defer OPENAI_API_KEY validation to `callOpenAI` which will attempt
//     // to load `.env.local` at runtime in local development.
//     let body: any;
//     try {
//       body = await req.json();
//     } catch (e) {
//       return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
//     }

//     const { companyName, jobDescription, techStack } = body || {};
//     if (!jobDescription) {
//       return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });
//     }

//     const system = EXTRACT_TOPICS_SYSTEM;
//     const user = buildExtractTopicsUserPrompt(companyName, techStack, jobDescription);

//     let content: string | undefined;
//     try {
//       // Try to obtain an API key: prefer process.env, otherwise read .env.local directly
//       let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//       if (!apiKey) {
//         try {
//           const fs = await import('fs');
//           const path = await import('path');
//           const p = path.resolve(process.cwd(), '.env.local');
//           if (fs.existsSync(p)) {
//             const txt = fs.readFileSync(p, 'utf8');
//             const m = txt.match(/OPENAI_API_KEY\s*=\s*(\S+)/);
//             if (m) apiKey = m[1];
//           }
//         } catch (e) {
//           // ignore
//         }
//       }

//       content = await callOpenAI(
//         [
//           { role: 'system', content: system },
//           { role: 'user', content: user },
//         ],
//         { temperature: 0 },
//         apiKey
//       );
//     } catch (e: any) {
//       const msg = e?.message || 'OpenAI request failed';
//       console.error('extract-topics: OpenAI error:', msg);
//       return NextResponse.json({ error: 'OpenAI error: ' + msg }, { status: 502 });
//     }

//     // Try to parse JSON from the model output
//     let parsed: any = null;
//     try {
//       parsed = JSON.parse(content || '{}');
//     } catch (e) {
//       // attempt to extract JSON substring
//       const m = (content || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
//       if (m) parsed = JSON.parse(m[0]);
//     }

//     const topicsRaw = parsed?.topics || parsed || [];

//     // Keep your original shape, but now we also pass through `section` if provided
//     const topics = Array.isArray(topicsRaw)
//       ? topicsRaw.map((t: any) => ({
//           id: t.id || uuidv4(),
//           title: t.title || String(t),
//           section: t.section || undefined,
//         }))
//       : [];

//     return NextResponse.json({ topics });
//   } catch (err: any) {
//     // Return useful error info for local dev (do not leak secrets)
//     const message = err?.message || 'Server error';
//     console.error('extract-topics: unexpected error:', message);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { callOpenAI } from '../../../src/lib/openai';
// import { EXTRACT_TOPICS_SYSTEM, buildExtractTopicsUserPrompt } from '../../../src/lib/prompts';
// import { v4 as uuidv4 } from 'uuid';

// // ── Robust JSON parsing (handles large outputs, markdown fences, trailing commas) ──

// function safeParseJson(input: string): unknown | null {
//   try { return JSON.parse(input); } catch { return null; }
// }

// function stripMarkdownCodeFences(input: string): string {
//   const match = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
//   return match?.[1]?.trim() || input.trim();
// }

// function extractFirstJsonObject(input: string): string | null {
//   let start = -1, depth = 0;
//   let inString = false, escaped = false;

//   for (let i = 0; i < input.length; i++) {
//     const ch = input[i];
//     if (start === -1) { if (ch === '{') { start = i; depth = 1; } continue; }
//     if (inString) {
//       if (escaped) { escaped = false; continue; }
//       if (ch === '\\') { escaped = true; continue; }
//       if (ch === '"') inString = false;
//       continue;
//     }
//     if (ch === '"') { inString = true; continue; }
//     if (ch === '{') depth++;
//     if (ch === '}') depth--;
//     if (depth === 0) return input.slice(start, i + 1);
//   }
//   return null;
// }

// function repairCommonJsonIssues(input: string): string {
//   return input
//     .replace(/[\u201C\u201D]/g, '"')
//     .replace(/[\u2018\u2019]/g, "'")
//     .replace(/,\s*([}\]])/g, '$1')
//     .trim();
// }

// function parseModelJsonObject(content: string | undefined): Record<string, unknown> | null {
//   if (!content) return null;
//   const normalized = stripMarkdownCodeFences(content);
//   const extracted = extractFirstJsonObject(normalized);
//   const candidates = [normalized, extracted].filter((v): v is string => Boolean(v));

//   for (const candidate of candidates) {
//     const direct = safeParseJson(candidate);
//     if (direct && typeof direct === 'object' && !Array.isArray(direct))
//       return direct as Record<string, unknown>;

//     const repaired = repairCommonJsonIssues(candidate);
//     const repairedParsed = safeParseJson(repaired);
//     if (repairedParsed && typeof repairedParsed === 'object' && !Array.isArray(repairedParsed))
//       return repairedParsed as Record<string, unknown>;
//   }
//   return null;
// }

// // ── Route handler ──────────────────────────────────────────────────────────────

// export async function POST(req: Request) {
//   try {
//     let body: unknown;
//     try { body = await req.json(); }
//     catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

//     const { companyName, jobDescription, techStack } =
//       (body as Record<string, string>) || {};

//     if (!jobDescription) {
//       return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });
//     }

//     const system = EXTRACT_TOPICS_SYSTEM;
//     const user = buildExtractTopicsUserPrompt(companyName, techStack, jobDescription);

//     let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//     if (!apiKey) {
//       try {
//         const fs = await import('fs');
//         const path = await import('path');
//         const p = path.resolve(process.cwd(), '.env.local');
//         if (fs.existsSync(p)) {
//           const txt = fs.readFileSync(p, 'utf8');
//           const m = txt.match(/OPENAI_API_KEY\s*=\s*(\S+)/);
//           if (m) apiKey = m[1];
//         }
//       } catch { /* ignore */ }
//     }

//     let content: string | undefined;
//     try {
//       content = await callOpenAI(
//         [
//           { role: 'system', content: system },
//           { role: 'user', content: user },
//         ],
//         { temperature: 0 },
//         apiKey
//       );
//     } catch (e: unknown) {
//       const msg = e instanceof Error ? e.message : 'OpenAI request failed';
//       console.error('extract-topics: OpenAI error:', msg);
//       return NextResponse.json({ error: 'OpenAI error: ' + msg }, { status: 502 });
//     }

//     // ── Robust parse — never crashes on large/malformed JSON ──
//     const parsed = parseModelJsonObject(content);
//     if (!parsed) {
//       const preview = (content || '').slice(0, 500);
//       console.error('extract-topics: invalid model JSON output:', preview);
//       return NextResponse.json(
//         { error: 'Model returned invalid JSON. Please retry.' },
//         { status: 502 }
//       );
//     }

//     const topicsRaw = parsed.topics;
//     const topics = Array.isArray(topicsRaw)
//       ? topicsRaw.map((t: unknown) => {
//           const item = t as Record<string, unknown>;
//           return {
//             id: (item.id as string) || uuidv4(),
//             title: (item.title as string) || String(t),
//             section: item.section === 'asked' || item.section === 'additional'
//               ? item.section
//               : 'asked',
//             level: item.level === 'intermediate' ? 'intermediate' : 'basic',
//           };
//         })
//       : [];

//     return NextResponse.json({ topics });
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : 'Server error';
//     console.error('extract-topics: unexpected error:', message);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { callOpenAI } from '../../../src/lib/openai';
import { EXTRACT_TOPICS_SYSTEM, buildExtractTopicsUserPrompt } from '../../../src/lib/prompts';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────────────────────────────────────
// JSON REPAIR UTILITIES
// Handles: markdown fences, curly quotes, trailing commas, TRUNCATED output
// ─────────────────────────────────────────────────────────────────────────────

function stripMarkdownCodeFences(input: string): string {
  const match = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() || input.trim();
}

function repairCurlyQuotesAndCommas(input: string): string {
  return input
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    .trim();
}

/**
 * Repairs truncated JSON by closing all open strings, arrays, and objects.
 * This handles the case where the model output is cut off mid-response.
 */
function repairTruncatedJson(input: string): string {
  let result = input.trimEnd();

  // Remove trailing incomplete string value or key (e.g., "interm or "title": "foo)
  // Strategy: walk backwards and find the last complete key-value pair
  result = result
    // Remove trailing comma before we close
    .replace(/,\s*$/, '')
    // Remove incomplete string at end: open quote with no closing quote
    .replace(/"[^"]*$/, '')
    // Remove trailing colon (incomplete key-value)
    .replace(/:\s*$/, '')
    // Remove trailing comma again after above removals
    .replace(/,\s*$/, '');

  // Count open brackets and braces to close them
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < result.length; i++) {
    const ch = result[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // Close any open structures in reverse order
  while (openBrackets > 0) { result += ']'; openBrackets--; }
  while (openBraces > 0) { result += '}'; openBraces--; }

  return result;
}

function safeParseJson(input: string): unknown | null {
  try { return JSON.parse(input); } catch { return null; }
}

/**
 * Full pipeline: strip fences → repair curly quotes/commas → try parse →
 * if fail, repair truncation → try parse again.
 */
function parseModelJsonObject(content: string | undefined): Record<string, unknown> | null {
  if (!content) return null;

  const pipeline = (raw: string): Record<string, unknown> | null => {
    const cleaned = repairCurlyQuotesAndCommas(raw);

    // Attempt 1: direct parse
    const direct = safeParseJson(cleaned);
    if (direct && typeof direct === 'object' && !Array.isArray(direct))
      return direct as Record<string, unknown>;

    // Attempt 2: repair truncation then parse
    const repaired = repairTruncatedJson(cleaned);
    const repairedParsed = safeParseJson(repaired);
    if (repairedParsed && typeof repairedParsed === 'object' && !Array.isArray(repairedParsed))
      return repairedParsed as Record<string, unknown>;

    return null;
  };

  // Try with markdown fences stripped first
  const stripped = stripMarkdownCodeFences(content);
  return pipeline(stripped) ?? pipeline(content);
}

// ─────────────────────────────────────────────────────────────────────────────
// API KEY LOADER
// ─────────────────────────────────────────────────────────────────────────────

async function resolveApiKey(): Promise<string | undefined> {
  let apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const p = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf8');
        const m = txt.match(/OPENAI_API_KEY\s*=\s*(\S+)/);
        if (m) apiKey = m[1];
      }
    } catch { /* ignore */ }
  }
  return apiKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────

function normalizeTopic(t: unknown): {
  id: string;
  title: string;
  section: 'asked' | 'additional';
  level: 'basic' | 'intermediate';
} {
  const item = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>;
  return {
    id: typeof item.id === 'string' && item.id ? item.id : uuidv4(),
    title: typeof item.title === 'string' && item.title ? item.title : String(t),
    section: item.section === 'additional' ? 'additional' : 'asked',
    level: item.level === 'intermediate' ? 'intermediate' : 'basic',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const { companyName, jobDescription, techStack } =
      (body as Record<string, string>) || {};

    if (!jobDescription) {
      return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });
    }

    // 2. Build prompts
    const system = EXTRACT_TOPICS_SYSTEM;
    const user = buildExtractTopicsUserPrompt(companyName, techStack, jobDescription);

    // 3. Resolve API key
    const apiKey = await resolveApiKey();

    // 4. Call OpenAI with a sufficient max_tokens to prevent truncation
    let content: string | undefined;
    try {
      content = await callOpenAI(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        {
          temperature: 0,
          max_tokens: 4096, // ← KEY FIX: prevents truncation on large topic lists
        },
        apiKey
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'OpenAI request failed';
      console.error('extract-topics: OpenAI error:', msg);
      return NextResponse.json({ error: 'OpenAI error: ' + msg }, { status: 502 });
    }

    // 5. Robust parse with truncation recovery
    const parsed = parseModelJsonObject(content);

    if (!parsed) {
      const preview = (content || '').slice(0, 500);
      console.error('extract-topics: could not parse model output after repair attempts:', preview);
      return NextResponse.json(
        { error: 'Model returned unparseable JSON. Please retry.' },
        { status: 502 }
      );
    }

    // 6. Normalize topics array
    const topicsRaw = parsed.topics;
    if (!Array.isArray(topicsRaw)) {
      console.error('extract-topics: parsed JSON has no topics array:', parsed);
      return NextResponse.json(
        { error: 'Model response missing topics array. Please retry.' },
        { status: 502 }
      );
    }

    const topics = topicsRaw.map(normalizeTopic);

    return NextResponse.json({ topics });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    console.error('extract-topics: unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
// import { NextResponse } from 'next/server';
// import { callOpenAI } from '../../../src/lib/openai';
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
//     if (!jobDescription) return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });

//     const system = `You are an assistant that extracts interview topics from job descriptions or interview questions.`;
//     const user = `Company: ${companyName}\nTech stack: ${techStack}\nDescription:\n${jobDescription}\n\nReturn a JSON array named \"topics\". Each topic is {\"id\":string, \"title\":string}. Keep output strictly as JSON.`;

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

//       content = await callOpenAI([
//         { role: 'system', content: system },
//         { role: 'user', content: user },
//       ], { temperature: 0 }, apiKey);
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
//     const topics = Array.isArray(topicsRaw) ? topicsRaw.map((t: any)=> ({ id: t.id || uuidv4(), title: t.title || String(t) })) : [];

//     return NextResponse.json({ topics });
//   } catch (err: any) {
//     // Return useful error info for local dev (do not leak secrets)
//     const message = err?.message || 'Server error';
//     console.error('extract-topics: unexpected error:', message);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { callOpenAI } from '../../../src/lib/openai';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    // Defer OPENAI_API_KEY validation to `callOpenAI` which will attempt
    // to load `.env.local` at runtime in local development.
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { companyName, jobDescription, techStack } = body || {};
    if (!jobDescription) {
      return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });
    }

    // ✅ Updated prompt (your provided instruction)
    const system =
      `You are an experienced interview expert. ` +
      `Extract only key interview topics from the provided interview questions context.`;

    // IMPORTANT: we still enforce STRICT JSON so your backend can parse reliably
    const user =
      `Based on the following interview questions asked to multiple students, identify and list ONLY the key topics that were actually asked in the interviews.\n\n` +
      `After listing the asked topics, add more closely related fundamentals to intermediate topics that are commonly asked in similar technical interviews.\n\n` +
      `❗ Rules to follow:\n` +
      `- Keep the output topic names only, no explanations\n` +
      `- Return STRICT JSON ONLY\n\n` +
      `Output format (STRICT):\n` +
      `{\n` +
      `  "topics": [\n` +
      `    { "id": "string", "title": "string", "section": "asked" | "additional" }\n` +
      `  ]\n` +
      `}\n\n` +
      `Interview Questions Context:\n` +
      `Company: ${companyName}\n` +
      `Tech stack: ${techStack}\n\n` +
      `${jobDescription}\n\n` +
      `Section 1: Topics Asked in Interview\n` +
      `Section 2: Additional Related Topics That Can Be Asked in most company Interviews\n`;

    let content: string | undefined;
    try {
      // Try to obtain an API key: prefer process.env, otherwise read .env.local directly
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
        } catch (e) {
          // ignore
        }
      }

      content = await callOpenAI(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { temperature: 0 },
        apiKey
      );
    } catch (e: any) {
      const msg = e?.message || 'OpenAI request failed';
      console.error('extract-topics: OpenAI error:', msg);
      return NextResponse.json({ error: 'OpenAI error: ' + msg }, { status: 502 });
    }

    // Try to parse JSON from the model output
    let parsed: any = null;
    try {
      parsed = JSON.parse(content || '{}');
    } catch (e) {
      // attempt to extract JSON substring
      const m = (content || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (m) parsed = JSON.parse(m[0]);
    }

    const topicsRaw = parsed?.topics || parsed || [];

    // Keep your original shape, but now we also pass through `section` if provided
    const topics = Array.isArray(topicsRaw)
      ? topicsRaw.map((t: any) => ({
          id: t.id || uuidv4(),
          title: t.title || String(t),
          section: t.section || undefined,
        }))
      : [];

    return NextResponse.json({ topics });
  } catch (err: any) {
    // Return useful error info for local dev (do not leak secrets)
    const message = err?.message || 'Server error';
    console.error('extract-topics: unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
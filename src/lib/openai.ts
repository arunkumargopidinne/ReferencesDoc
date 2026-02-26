// Server-side OpenAI helper

// Defer reading `OPENAI_API_KEY` until the helper is called so importing
// this module does not throw during development when env vars may be unset.
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function tryLoadDotenv() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const p = path.resolve(process.cwd(), '.env.local');
    const exists = fs.existsSync(p);
    console.error('tryLoadDotenv:', p, 'exists=', exists);
    if (!exists) return;
    const txt = fs.readFileSync(p, 'utf8');
    console.error('tryLoadDotenv: .env.local length=', txt.length);
    txt.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) return;
      const key = m[1];
      let val = m[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      const willSet = !process.env[key];
      if (willSet) process.env[key] = val;
      console.error('tryLoadDotenv: parsed', { key, len: val.length, willSet, current: process.env[key] ? '[REDACTED]' : null });
    });
  } catch (e) {
    // ignore
  }
}

export async function callOpenAI(messages: Array<{ role: string; content: string }>, opts?: { temperature?: number }, apiKey?: string) {
  let OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    await tryLoadDotenv();
    OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    console.error('callOpenAI: after tryLoadDotenv OPENAI_API_KEY present=', Boolean(OPENAI_API_KEY), 'len=', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
  }
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY in environment');
  }

  const body = {
    model: DEFAULT_MODEL,
    messages,
    temperature: opts?.temperature ?? 0.2,
    max_tokens: 1200,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return content;
}

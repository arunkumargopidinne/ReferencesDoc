import { NextResponse } from 'next/server';
import { callOpenAI } from '../../../src/lib/openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration: OPENAI_API_KEY is not set' }, { status: 500 });
    }
    const body = await req.json();
    const { topics, previousMarkdown } = body;
    if (!topics || !Array.isArray(topics)) return NextResponse.json({ error: 'Missing topics' }, { status: 400 });

    const prompt = `You are an interview prep assistant. Improve and expand the previous markdown content while keeping structure. Previous content:\n${previousMarkdown || ''}\n\nTopics:\n${topics.map((t:any)=>'- '+t.title).join('\n')}\n\nReturn only updated Markdown.`;

    const content = await callOpenAI([
      { role: 'system', content: 'You output Markdown content only.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.3 });

    return NextResponse.json({ markdown: content });
  } catch (err: any) {
    const message = err?.message || 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

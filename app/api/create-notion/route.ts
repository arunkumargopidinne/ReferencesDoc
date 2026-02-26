import { NextResponse } from 'next/server';
import { createNotionPage } from '../../../src/lib/notion';

export async function POST(req: Request) {
  const notionToken = process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || '';
  try {
    if (!notionToken) {
      return NextResponse.json({ error: 'Server misconfiguration: NOTION_TOKEN is not set' }, { status: 500 });
    }

    const { title, markdown } = await req.json();
    if (!title || !markdown) return NextResponse.json({ error: 'Missing title or markdown' }, { status: 400 });

    const notionRes = await createNotionPage(title, markdown);
    const fallbackUrl = `https://www.notion.so/${notionRes?.id?.replace(/-/g, '')}`;
    const url = notionRes?.url || fallbackUrl;
    const publicUrl = notionRes?.public_url || '';
    const preferredUrl = publicUrl || url;

    return NextResponse.json({
      id: notionRes?.id || '',
      url,
      publicUrl,
      preferredUrl,
      raw: notionRes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    // Notion API returns the page object. Try to build a link if possible.
    const url = notionRes?.url || `https://www.notion.so/${notionRes?.id?.replace(/-/g, '')}`;
    return NextResponse.json({ url, raw: notionRes });
  } catch (err: any) {
    const message = err?.message || 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

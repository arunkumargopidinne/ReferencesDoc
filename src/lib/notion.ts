require('dotenv').config();

// Server-side Notion helper
// Read credentials from environment variables (do NOT commit tokens to source)
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || '';
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || '';

if (!NOTION_TOKEN) {
  throw new Error('Missing NOTION_TOKEN in environment. Set NOTION_TOKEN in your .env.local and restart the dev server.');
}
if (!NOTION_DATABASE_ID) {
  throw new Error('Missing NOTION_DATABASE_ID in environment. Set NOTION_DATABASE_ID in your .env.local and restart the dev server.');
}

export async function createNotionPage(title: string, markdownContent: string) {
  const url = 'https://api.notion.com/v1/pages';

  // Notion restricts paragraph text to 2000 characters per rich_text item.
  // If the generated content exceeds that, split it into multiple blocks.
  const maxLen = 2000;
  const chunks: string[] = [];
  for (let i = 0; i < markdownContent.length; i += maxLen) {
    chunks.push(markdownContent.slice(i, i + maxLen));
  }

  const children = chunks.map((chunk) => ({
    object: 'block',
    paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] },
  }));

  const body = {
    parent: NOTION_DATABASE_ID ? { database_id: NOTION_DATABASE_ID } : { type: 'workspace' },
    properties: {
      Name: {
        title: [{ text: { content: title } }],
      },
    },
    children,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    // Try to parse Notion JSON error for better guidance
    let parsed: any = null;
    try { parsed = JSON.parse(txt); } catch (_) { parsed = null; }

    if (res.status === 404 && parsed?.code === 'object_not_found') {
      throw new Error(
        `Notion error 404: Could not find database with ID: ${NOTION_DATABASE_ID || '(no id set)'}.` +
        ' Make sure the ID is the correct database ID and that you have shared the database with your integration (Share → Invite your integration).' +
        ' To obtain the database ID: open the database in Notion, click "Share" → "Copy link", then extract the 32-character ID from the URL (format 8-4-4-4-12 or without hyphens).'
      );
    }

    throw new Error(`Notion error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  // Return shareable URL if available, otherwise full response
  return data;
}

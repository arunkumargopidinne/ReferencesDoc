import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";

const MAX_CHILDREN_PER_REQUEST = 100;
const MAX_RICH_TEXT_LENGTH = 2000;

type CreatePageParams = Parameters<Client["pages"]["create"]>[0];
type CreatePageChildren = NonNullable<CreatePageParams["children"]>;
type CreatePageChild = CreatePageChildren[number];
type AppendChildrenParams = Parameters<Client["blocks"]["children"]["append"]>[0];
type AppendChildren = AppendChildrenParams["children"];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function stripOuterFence(markdown: string) {
  let out = markdown.trim();
  const hasOuterFence =
    /^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out);

  if (hasOuterFence) {
    out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    out = out.replace(/\n```$/, "");
  }

  return out.trim();
}

function buildFallbackParagraphBlocks(text: string): CreatePageChild[] {
  const chunks: string[] = [];
  const normalized = text.replace(/\r\n/g, "\n").trim();

  for (let i = 0; i < normalized.length; i += MAX_RICH_TEXT_LENGTH) {
    chunks.push(normalized.slice(i, i + MAX_RICH_TEXT_LENGTH));
  }

  if (!chunks.length) {
    return [];
  }

  return chunks.map((chunk) => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: chunk },
        },
      ],
    },
  }));
}

export async function createNotionPage(title: string, markdownContent: string) {
  const notionToken =
    process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";
  const notionDatabaseId =
    process.env.NOTION_DATABASE_ID ||
    process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ||
    "";

  if (!notionToken) {
    throw new Error(
      "Missing NOTION_TOKEN in environment. Set NOTION_TOKEN in your .env.local and restart the dev server."
    );
  }

  if (!notionDatabaseId) {
    throw new Error(
      "Missing NOTION_DATABASE_ID in environment. Set NOTION_DATABASE_ID in your .env.local and restart the dev server."
    );
  }

  const notion = new Client({ auth: notionToken });

  const normalizedMarkdown = stripOuterFence((markdownContent || "").trim());
  let blocks: CreatePageChild[] = [];

  try {
    blocks = markdownToBlocks(normalizedMarkdown) as unknown as CreatePageChild[];
  } catch {
    blocks = buildFallbackParagraphBlocks(normalizedMarkdown);
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    blocks = buildFallbackParagraphBlocks(normalizedMarkdown);
  }

  const blockChunks = chunkArray(blocks, MAX_CHILDREN_PER_REQUEST);
  const pageTitle = (title || "Untitled").slice(0, 200);

  const response = await notion.pages.create({
    parent: { database_id: notionDatabaseId },
    properties: {
      Name: {
        title: [{ text: { content: pageTitle } }],
      },
    },
    children: (blockChunks[0] ?? []) as unknown as CreatePageChildren,
  });

  if (blockChunks.length > 1) {
    for (let i = 1; i < blockChunks.length; i++) {
      await notion.blocks.children.append({
        block_id: response.id,
        children: blockChunks[i] as unknown as AppendChildren,
      });
    }
  }

  return response;
}

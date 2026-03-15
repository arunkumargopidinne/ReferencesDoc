import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { withNotionWriteRetry } from "./notionClientRetry";

const MAX_CHILDREN_PER_REQUEST = 100;
const MAX_RICH_TEXT_LENGTH = 2000;

type CreatePageParams = Parameters<Client["pages"]["create"]>[0];
type CreatePageChildren = NonNullable<CreatePageParams["children"]>;
type CreatePageChild = CreatePageChildren[number];
type AppendChildrenParams = Parameters<Client["blocks"]["children"]["append"]>[0];
type AppendChildren = AppendChildrenParams["children"];
type BlockObject = Record<string, unknown>;

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
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const chunks: string[] = [];

  for (let i = 0; i < normalized.length; i += MAX_RICH_TEXT_LENGTH) {
    chunks.push(normalized.slice(i, i + MAX_RICH_TEXT_LENGTH));
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

function getBlockType(block: BlockObject): string | null {
  return typeof block.type === "string" ? block.type : null;
}

function getBlockContent(block: BlockObject, blockType: string): BlockObject {
  const value = block[blockType];
  return value && typeof value === "object"
    ? (value as BlockObject)
    : {};
}

function getChildren(blockContent: BlockObject): BlockObject[] {
  return Array.isArray(blockContent.children)
    ? (blockContent.children as BlockObject[])
    : [];
}

function stripChildrenRecursively(blocks: BlockObject[]): BlockObject[] {
  const flattened: BlockObject[] = [];

  for (const block of blocks) {
    const blockType = getBlockType(block);

    if (!blockType) {
      flattened.push(block);
      continue;
    }

    const blockContent = getBlockContent(block, blockType);
    const children = getChildren(blockContent);

    if (children.length === 0) {
      flattened.push(block);
      continue;
    }

    const strippedContent = { ...blockContent };
    delete strippedContent.children;

    flattened.push({
      ...block,
      [blockType]: strippedContent,
    });
    flattened.push(...stripChildrenRecursively(children));
  }

  return flattened;
}

function flattenAssignmentBlocks(
  blocks: BlockObject[],
  depth = 0
): BlockObject[] {
  const result: BlockObject[] = [];

  for (const block of blocks) {
    const blockType = getBlockType(block);

    if (!blockType) {
      result.push(block);
      continue;
    }

    const blockContent = getBlockContent(block, blockType);
    const children = getChildren(blockContent);

    if (children.length === 0) {
      result.push(block);
      continue;
    }

    if (depth >= 2) {
      const strippedContent = { ...blockContent };
      delete strippedContent.children;

      result.push({
        ...block,
        [blockType]: strippedContent,
      });
      result.push(...stripChildrenRecursively(children));
      continue;
    }

    const fixedChildren = flattenAssignmentBlocks(children, depth + 1);

    result.push({
      ...block,
      [blockType]: {
        ...blockContent,
        children: fixedChildren,
      },
    });
  }

  return result;
}

function truncateRichTextInBlocks(blocks: BlockObject[]): BlockObject[] {
  return blocks.map((block) => {
    const blockType = getBlockType(block);

    if (!blockType) {
      return block;
    }

    const blockContent = getBlockContent(block, blockType);
    const richText = Array.isArray(blockContent.rich_text)
      ? (blockContent.rich_text as Array<Record<string, unknown>>)
      : undefined;

    let nextContent: BlockObject = blockContent;

    if (richText) {
      const truncatedRichText = richText.map((item) => {
        const text = item.text;

        if (!text || typeof text !== "object") {
          return item;
        }

        const content = (text as Record<string, unknown>).content;

        if (typeof content !== "string" || content.length <= MAX_RICH_TEXT_LENGTH) {
          return item;
        }

        return {
          ...item,
          text: {
            ...(text as Record<string, unknown>),
            content: content.slice(0, MAX_RICH_TEXT_LENGTH),
          },
        };
      });

      nextContent = {
        ...nextContent,
        rich_text: truncatedRichText,
      };
    }

    const children = getChildren(nextContent);

    if (children.length > 0) {
      nextContent = {
        ...nextContent,
        children: truncateRichTextInBlocks(children),
      };
    }

    return {
      ...block,
      [blockType]: nextContent,
    };
  });
}

function sanitizeAssignmentBlocks(blocks: CreatePageChild[]): CreatePageChild[] {
  const flattened = flattenAssignmentBlocks(
    blocks as unknown as BlockObject[],
    0
  );
  const truncated = truncateRichTextInBlocks(flattened);

  return truncated as unknown as CreatePageChild[];
}

export async function createAssignmentNotionPage(
  title: string,
  markdownContent: string
) {
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
    blocks = sanitizeAssignmentBlocks(blocks);
  } catch {
    blocks = buildFallbackParagraphBlocks(normalizedMarkdown);
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    blocks = buildFallbackParagraphBlocks(normalizedMarkdown);
  }

  const blockChunks = chunkArray(blocks, MAX_CHILDREN_PER_REQUEST);
  const pageTitle = (title || "Untitled").slice(0, 200);

  const response = await withNotionWriteRetry("pages.create(assignment)", () =>
    notion.pages.create({
      parent: { database_id: notionDatabaseId },
      properties: {
        Name: {
          title: [{ text: { content: pageTitle } }],
        },
      },
      children: (blockChunks[0] ?? []) as unknown as CreatePageChildren,
    })
  );

  for (let i = 1; i < blockChunks.length; i++) {
    await withNotionWriteRetry(`blocks.children.append(assignment chunk ${i})`, () =>
      notion.blocks.children.append({
        block_id: response.id,
        children: blockChunks[i] as unknown as AppendChildren,
      })
    );
  }

  return response;
}

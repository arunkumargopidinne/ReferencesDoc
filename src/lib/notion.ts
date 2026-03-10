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

  const response = await withNotionWriteRetry("pages.create(markdown)", () =>
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

  if (blockChunks.length > 1) {
    for (let i = 1; i < blockChunks.length; i++) {
      await withNotionWriteRetry(`blocks.children.append(markdown chunk ${i})`, () =>
        notion.blocks.children.append({
          block_id: response.id,
          children: blockChunks[i] as unknown as AppendChildren,
        })
      );
    }
  }

  return response;
}



// import { Client } from "@notionhq/client";
// import { markdownToBlocks } from "@tryfabric/martian";

// const MAX_CHILDREN_PER_REQUEST = 100;
// const MAX_RICH_TEXT_LENGTH = 2000;

// type BlockObject = Record<string, unknown>;

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// function stripOuterFence(markdown: string) {
//   let out = markdown.trim();
//   if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// function buildFallbackParagraphBlocks(text: string): BlockObject[] {
//   const normalized = text.replace(/\r\n/g, "\n").trim();
//   const chunks: string[] = [];
//   for (let i = 0; i < normalized.length; i += MAX_RICH_TEXT_LENGTH) {
//     chunks.push(normalized.slice(i, i + MAX_RICH_TEXT_LENGTH));
//   }
//   return chunks.map((chunk) => ({
//     object: "block",
//     type: "paragraph",
//     paragraph: { rich_text: [{ type: "text", text: { content: chunk } }] },
//   }));
// }

// /**
//  * Converts a block with children into a flat paragraph block,
//  * preserving the text content from rich_text.
//  */
// function blockToFlatParagraph(blockContent: BlockObject): BlockObject {
//   const richText = (blockContent.rich_text as unknown[]) ?? [];
//   return {
//     object: "block",
//     type: "paragraph",
//     paragraph: { rich_text: richText },
//   };
// }

// /**
//  * Recursively flattens the block tree so no list item is nested
//  * more than 1 level deep (Notion's hard limit is 2 levels total:
//  * the list item itself + one level of children).
//  *
//  * Strategy:
//  * - depth 0 → top-level blocks: allow children, recurse into them at depth 1
//  * - depth 1 → first-level children: allow children, but their children must be stripped
//  * - depth 2+ → grandchildren: no children allowed; convert to flat paragraph siblings
//  *
//  * Stripped grandchildren are returned as siblings AFTER their parent so content is preserved.
//  */
// function flattenBlocks(blocks: BlockObject[], depth = 0): BlockObject[] {
//   const result: BlockObject[] = [];

//   for (const block of blocks) {
//     const blockType = block.type as string;
//     const blockContent = (block[blockType] ?? {}) as BlockObject;
//     const children = blockContent.children as BlockObject[] | undefined;

//     if (!children || children.length === 0) {
//       // No children — emit as-is
//       result.push(block);
//       continue;
//     }

//     if (depth >= 1) {
//       // At depth 1, children's children (depth 2) cannot exist in Notion.
//       // Process each child: strip ITS children and hoist them as siblings.
//       const fixedChildren: BlockObject[] = [];
//       const hoisted: BlockObject[] = [];

//       for (const child of children) {
//         const childType = child.type as string;
//         const childContent = (child[childType] ?? {}) as BlockObject;
//         const grandchildren = childContent.children as BlockObject[] | undefined;

//         if (grandchildren && grandchildren.length > 0) {
//           // Strip grandchildren from this child
//           const strippedContent = { ...childContent };
//           delete strippedContent.children;
//           fixedChildren.push({ ...child, [childType]: strippedContent });

//           // Hoist grandchildren as flat paragraphs after this block
//           for (const gc of grandchildren) {
//             hoisted.push(blockToFlatParagraph((gc[(gc.type as string)] ?? {}) as BlockObject));
//           }
//         } else {
//           fixedChildren.push(child);
//         }
//       }

//       result.push({
//         ...block,
//         [blockType]: { ...blockContent, children: fixedChildren },
//       });

//       // Emit hoisted grandchildren as siblings after the parent block
//       result.push(...hoisted);
//     } else {
//       // depth 0: recurse into children at depth 1
//       const fixedChildren = flattenBlocks(children, depth + 1);
//       result.push({
//         ...block,
//         [blockType]: { ...blockContent, children: fixedChildren },
//       });
//     }
//   }

//   return result;
// }

// /**
//  * Truncates rich_text arrays to Notion's 2000-char limit per element.
//  */
// function truncateRichText(blocks: BlockObject[]): BlockObject[] {
//   return blocks.map((block) => {
//     const blockType = block.type as string;
//     const blockContent = (block[blockType] ?? {}) as BlockObject;

//     const richText = blockContent.rich_text as Array<Record<string, unknown>> | undefined;
//     let updated = blockContent;

//     if (richText && Array.isArray(richText)) {
//       const truncated = richText.map((rt) => {
//         const text = rt.text as Record<string, unknown> | undefined;
//         if (text && typeof text.content === "string" && text.content.length > MAX_RICH_TEXT_LENGTH) {
//           return { ...rt, text: { ...text, content: text.content.slice(0, MAX_RICH_TEXT_LENGTH) } };
//         }
//         return rt;
//       });
//       updated = { ...blockContent, rich_text: truncated };
//     }

//     const children = updated.children as BlockObject[] | undefined;
//     if (children && Array.isArray(children)) {
//       updated = { ...updated, children: truncateRichText(children) };
//     }

//     return { ...block, [blockType]: updated };
//   });
// }

// export async function createNotionPage(title: string, markdownContent: string) {
//   const notionToken =
//     process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";
//   const notionDatabaseId =
//     process.env.NOTION_DATABASE_ID || process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || "";

//   if (!notionToken) throw new Error("Missing NOTION_TOKEN in environment.");
//   if (!notionDatabaseId) throw new Error("Missing NOTION_DATABASE_ID in environment.");

//   const notion = new Client({ auth: notionToken });
//   const normalizedMarkdown = stripOuterFence((markdownContent || "").trim());

//   let blocks: BlockObject[] = [];
//   try {
//     blocks = markdownToBlocks(normalizedMarkdown) as unknown as BlockObject[];
//   } catch {
//     blocks = buildFallbackParagraphBlocks(normalizedMarkdown);
//   }

//   if (!Array.isArray(blocks) || blocks.length === 0) {
//     blocks = buildFallbackParagraphBlocks(normalizedMarkdown);
//   }

//   // Fix 1: Flatten nesting beyond Notion's 2-level limit
//   blocks = flattenBlocks(blocks, 0);
//   // Fix 2: Truncate rich_text over 2000 chars
//   blocks = truncateRichText(blocks);

//   const blockChunks = chunkArray(blocks, MAX_CHILDREN_PER_REQUEST);
//   const pageTitle = (title || "Untitled").slice(0, 200);

//   const response = await notion.pages.create({
//     parent: { database_id: notionDatabaseId },
//     properties: {
//       Name: { title: [{ text: { content: pageTitle } }] },
//     },
//     children: (blockChunks[0] ?? []) as Parameters<Client["pages"]["create"]>[0]["children"],
//   });

//   for (let i = 1; i < blockChunks.length; i++) {
//     await notion.blocks.children.append({
//       block_id: response.id,
//       children: blockChunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
//     });
//   }

//   return response;
// }

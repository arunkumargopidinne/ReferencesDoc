// import { Client } from "@notionhq/client";
// import { markdownToBlocks } from "@tryfabric/martian";
// import { withNotionWriteRetry } from "./notionClientRetry";

// type AnyBlock = Record<string, unknown>;

// // ─── helpers ──────────────────────────────────────────────────────────────────

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// function stripOuterFence(md: string) {
//   let out = md.trim();
//   if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// // ─── section parser ───────────────────────────────────────────────────────────

// /**
//  * Splits markdown into sections based on the given heading prefix.
//  * e.g. "## " splits by level-2 headings, "### " by level-3.
//  *
//  * Returns an array of { title, body } objects.
//  */
// function parseSections(
//   markdown: string,
//   headingPrefix: string
// ): Array<{ title: string; body: string }> {
//   const normalized = markdown.replace(/\r\n/g, "\n").trim();
//   const lines = normalized.split("\n");
//   const sections: Array<{ title: string; body: string }> = [];
//   let currentTitle = "";
//   let currentBodyLines: string[] = [];

//   for (const line of lines) {
//     if (line.startsWith(headingPrefix)) {
//       if (currentTitle) {
//         sections.push({
//           title: currentTitle,
//           body: currentBodyLines.join("\n").trim(),
//         });
//       }
//       // Strip heading markers (##, ###, etc.)
//       currentTitle = line.replace(/^#{2,6}\s+/, "").trim();
//       currentBodyLines = [];
//     } else {
//       currentBodyLines.push(line);
//     }
//   }

//   if (currentTitle) {
//     sections.push({
//       title: currentTitle,
//       body: currentBodyLines.join("\n").trim(),
//     });
//   }

//   return sections;
// }

// function parseParentChildSections(
//   markdown: string,
//   parentPrefix = "## ",
//   childPrefix = "### "
// ): Array<{ parentTitle: string; sections: Array<{ title: string; body: string }> }> {
//   const normalized = markdown.replace(/\r\n/g, "\n").trim();
//   const lines = normalized.split("\n");
//   const groups: Array<{ parentTitle: string; bodyLines: string[] }> = [];

//   let currentParent = "";
//   let currentBodyLines: string[] = [];

//   for (const line of lines) {
//     if (line.startsWith(parentPrefix) && !line.startsWith(childPrefix)) {
//       if (currentParent) {
//         groups.push({ parentTitle: currentParent, bodyLines: currentBodyLines });
//       }
//       currentParent = line.slice(parentPrefix.length).trim();
//       currentBodyLines = [];
//       continue;
//     }

//     if (currentParent) {
//       currentBodyLines.push(line);
//     }
//   }

//   if (currentParent) {
//     groups.push({ parentTitle: currentParent, bodyLines: currentBodyLines });
//   }

//   return groups
//     .map((group) => {
//       const body = group.bodyLines.join("\n").trim();
//       const sections = parseSections(body, childPrefix);
//       return { parentTitle: group.parentTitle, sections };
//     })
//     .filter((group) => group.sections.length > 0);
// }

// /**
//  * Tries to detect the best heading prefix by checking which level exists.
//  * Prefers "## " > "### " > "# ".
//  */
// function detectHeadingPrefix(markdown: string): string {
//   if (/\n## /.test(markdown) || markdown.startsWith("## ")) return "## ";
//   if (/\n### /.test(markdown) || markdown.startsWith("### ")) return "### ";
//   return "# ";
// }

// // ─── toggle block builder ─────────────────────────────────────────────────────

// /**
//  * Notion only allows 2 levels of nesting inside list items.
//  * Within a toggle's children, blocks at depth 0 may have children,
//  * but blocks at depth 1 (children of those children) may NOT have children.
//  *
//  * This function strips children from depth-1+ blocks and hoists them as flat
//  * siblings so content is preserved without invalid nesting.
//  */
// function stripChildrenRecursively(blocks: AnyBlock[]): AnyBlock[] {
//   const flattened: AnyBlock[] = [];

//   for (const block of blocks) {
//     const blockType = block.type as string;
//     const blockContent = (block[blockType] ?? {}) as AnyBlock;
//     const children = blockContent.children as AnyBlock[] | undefined;

//     if (!children || children.length === 0) {
//       flattened.push(block);
//       continue;
//     }

//     const strippedContent = { ...blockContent };
//     delete strippedContent.children;

//     flattened.push({
//       ...block,
//       [blockType]: strippedContent,
//     });
//     flattened.push(...stripChildrenRecursively(children));
//   }

//   return flattened;
// }

// function flattenBodyBlocks(blocks: AnyBlock[], depth = 0): AnyBlock[] {
//   const result: AnyBlock[] = [];

//   for (const block of blocks) {
//     const blockType = block.type as string;
//     const blockContent = (block[blockType] ?? {}) as AnyBlock;
//     const children = blockContent.children as AnyBlock[] | undefined;

//     if (!children || children.length === 0) {
//       result.push(block);
//       continue;
//     }

//     if (depth >= 1) {
//       // Nested blocks at this depth cannot carry children in Notion.
//       const strippedContent = { ...blockContent };
//       delete strippedContent.children;
//       result.push({ ...block, [blockType]: strippedContent });
//       result.push(...stripChildrenRecursively(children));
//       continue;
//     }

//     // depth 0: keep direct children, but force them to be leaf blocks.
//     const fixedChildren: AnyBlock[] = [];
//     const hoisted: AnyBlock[] = [];

//     for (const child of children) {
//       const childType = child.type as string;
//       const childContent = (child[childType] ?? {}) as AnyBlock;
//       const grandchildren = childContent.children as AnyBlock[] | undefined;

//       if (!grandchildren || grandchildren.length === 0) {
//         fixedChildren.push(child);
//         continue;
//       }

//       const strippedChildContent = { ...childContent };
//       delete strippedChildContent.children;
//       fixedChildren.push({ ...child, [childType]: strippedChildContent });
//       hoisted.push(...stripChildrenRecursively(grandchildren));
//     }

//     result.push({
//       ...block,
//       [blockType]: { ...blockContent, children: fixedChildren },
//     });
//     result.push(...hoisted);
//   }

//   return result;
// }

// function buildBodyBlocks(body: string): AnyBlock[] {
//   if (!body.trim()) return [];
//   try {
//     const blocks = markdownToBlocks(body) as unknown as AnyBlock[];
//     return flattenBodyBlocks(blocks);
//   } catch {
//     return [
//       {
//         object: "block",
//         type: "paragraph",
//         paragraph: {
//           rich_text: [{ type: "text", text: { content: body.slice(0, 2000) } }],
//         },
//       },
//     ];
//   }
// }

// function buildToggleBlock(title: string, bodyBlocks: AnyBlock[]): AnyBlock {
//   return {
//     object: "block",
//     type: "toggle",
//     toggle: {
//       rich_text: [
//         {
//           type: "text",
//           text: { content: title.slice(0, 2000) },
//           annotations: { bold: true },
//         },
//       ],
//       color: "default",
//       // Notion allows up to 99 nested children per block in a single create call
//       children: bodyBlocks.slice(0, 99),
//     },
//   };
// }

// function buildHeading2Block(text: string): AnyBlock {
//   return {
//     object: "block",
//     type: "heading_2",
//     heading_2: {
//       rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }],
//       color: "default",
//       is_toggleable: false,
//     },
//   };
// }

// // ─── public API ───────────────────────────────────────────────────────────────

// /**
//  * Creates a Notion page where each top-level section of the markdown is
//  * wrapped in a collapsible toggle block.
//  *
//  * @param title         - Notion page title
//  * @param markdown      - Generated markdown content
//  * @param headingLevel  - "##" for topic-level sections, "###" for Q&A sections.
//  *                        When omitted the function auto-detects the heading level.
//  */
// export async function createNotionPageWithToggles(
//   title: string,
//   markdown: string,
//   headingLevel?: "##" | "###"
// ) {
//   const notionToken =
//     process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";
//   const notionDatabaseId =
//     process.env.NOTION_DATABASE_ID ||
//     process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ||
//     "";

//   if (!notionToken)
//     throw new Error(
//       "Missing NOTION_TOKEN. Set it in .env.local and restart the dev server."
//     );
//   if (!notionDatabaseId)
//     throw new Error(
//       "Missing NOTION_DATABASE_ID. Set it in .env.local and restart the dev server."
//     );

//   const notion = new Client({ auth: notionToken });

//   const cleanMd = stripOuterFence((markdown || "").trim());

//   // Determine heading prefix
//   let headingPrefix: string;
//   if (headingLevel) {
//     headingPrefix = headingLevel + " ";
//   } else {
//     headingPrefix = detectHeadingPrefix(cleanMd);
//   }

//   // Parse sections
//   let sections = parseSections(cleanMd, headingPrefix);

//   // Special case: when callers request ### toggles and markdown has ## groups,
//   // render each ## group as a heading followed by ### toggles under it.
//   if (headingPrefix === "### ") {
//     const groupedSections = parseParentChildSections(cleanMd, "## ", "### ");
//     if (groupedSections.length > 0) {
//       const groupedBlocks: AnyBlock[] = [];
//       for (const group of groupedSections) {
//         groupedBlocks.push(buildHeading2Block(group.parentTitle));
//         for (const section of group.sections) {
//           groupedBlocks.push(buildToggleBlock(section.title, buildBodyBlocks(section.body)));
//         }
//       }

//       const groupedChunks = chunkArray(groupedBlocks, 100);
//       const pageTitle = (title || "Untitled").slice(0, 200);

//       const groupedResponse = await withNotionWriteRetry(
//         "pages.create(grouped toggles)",
//         () =>
//           notion.pages.create({
//             parent: { database_id: notionDatabaseId },
//             properties: {
//               Name: { title: [{ text: { content: pageTitle } }] },
//             },
//             children: groupedChunks[0] as Parameters<
//               Client["pages"]["create"]
//             >[0]["children"],
//           })
//       );

//       for (let i = 1; i < groupedChunks.length; i++) {
//         await withNotionWriteRetry(`blocks.children.append(grouped chunk ${i})`, () =>
//           notion.blocks.children.append({
//             block_id: groupedResponse.id,
//             children: groupedChunks[i] as Parameters<
//               Client["blocks"]["children"]["append"]
//             >[0]["children"],
//           })
//         );
//       }

//       return groupedResponse;
//     }
//   }

//   // Fallback: if auto-detect returned no sections, try the other common level
//   if (sections.length === 0 && headingPrefix === "## ") {
//     sections = parseSections(cleanMd, "### ");
//   }
//   if (sections.length === 0 && headingPrefix === "### ") {
//     sections = parseSections(cleanMd, "## ");
//   }

//   // Last resort: treat the entire content as one toggle
//   if (sections.length === 0) {
//     sections = [{ title: title, body: cleanMd }];
//   }

//   // Build toggle blocks
//   const toggleBlocks: AnyBlock[] = sections.map((sec) =>
//     buildToggleBlock(sec.title, buildBodyBlocks(sec.body))
//   );

//   // Notion API: max 100 top-level blocks per request
//   const topChunks = chunkArray(toggleBlocks, 100);
//   const pageTitle = (title || "Untitled").slice(0, 200);

//   const response = await withNotionWriteRetry("pages.create(toggles)", () =>
//     notion.pages.create({
//       parent: { database_id: notionDatabaseId },
//       properties: {
//         Name: { title: [{ text: { content: pageTitle } }] },
//       },
//       children: topChunks[0] as Parameters<
//         Client["pages"]["create"]
//       >[0]["children"],
//     })
//   );

//   // Append remaining toggle chunk batches (if there are > 100 sections)
//   for (let i = 1; i < topChunks.length; i++) {
//     await withNotionWriteRetry(`blocks.children.append(toggle chunk ${i})`, () =>
//       notion.blocks.children.append({
//         block_id: response.id,
//         children: topChunks[i] as Parameters<
//           Client["blocks"]["children"]["append"]
//         >[0]["children"],
//       })
//     );
//   }

//   return response;
// }

//working well to other services 


// import { Client } from "@notionhq/client";
// import { markdownToBlocks } from "@tryfabric/martian";
// import { withNotionWriteRetry } from "./notionClientRetry";

// type AnyBlock = Record<string, unknown>;

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// function stripOuterFence(md: string) {
//   let out = md.trim();
//   if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
//     out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
//     out = out.replace(/\n```$/, "");
//   }
//   return out.trim();
// }

// function parseSections(
//   markdown: string,
//   headingPrefix: string
// ): Array<{ title: string; body: string }> {
//   const normalized = markdown.replace(/\r\n/g, "\n").trim();
//   const lines = normalized.split("\n");
//   const sections: Array<{ title: string; body: string }> = [];
//   let currentTitle = "";
//   let currentBodyLines: string[] = [];

//   for (const line of lines) {
//     if (line.startsWith(headingPrefix) && !line.startsWith(headingPrefix + "#")) {
//       if (currentTitle) {
//         sections.push({ title: currentTitle, body: currentBodyLines.join("\n").trim() });
//       }
//       currentTitle = line.replace(/^#{1,6}\s+/, "").trim();
//       currentBodyLines = [];
//     } else {
//       currentBodyLines.push(line);
//     }
//   }

//   if (currentTitle) {
//     sections.push({ title: currentTitle, body: currentBodyLines.join("\n").trim() });
//   }

//   return sections;
// }

// function stripChildrenRecursively(blocks: AnyBlock[]): AnyBlock[] {
//   const flattened: AnyBlock[] = [];
//   for (const block of blocks) {
//     const blockType = block.type as string;
//     const blockContent = (block[blockType] ?? {}) as AnyBlock;
//     const children = blockContent.children as AnyBlock[] | undefined;
//     if (!children || children.length === 0) {
//       flattened.push(block);
//       continue;
//     }
//     const strippedContent = { ...blockContent };
//     delete strippedContent.children;
//     flattened.push({ ...block, [blockType]: strippedContent });
//     flattened.push(...stripChildrenRecursively(children));
//   }
//   return flattened;
// }

// function flattenBodyBlocks(blocks: AnyBlock[], depth = 0): AnyBlock[] {
//   const result: AnyBlock[] = [];
//   for (const block of blocks) {
//     const blockType = block.type as string;
//     const blockContent = (block[blockType] ?? {}) as AnyBlock;
//     const children = blockContent.children as AnyBlock[] | undefined;

//     if (!children || children.length === 0) {
//       result.push(block);
//       continue;
//     }

//     if (depth >= 1) {
//       const strippedContent = { ...blockContent };
//       delete strippedContent.children;
//       result.push({ ...block, [blockType]: strippedContent });
//       result.push(...stripChildrenRecursively(children));
//       continue;
//     }

//     const fixedChildren: AnyBlock[] = [];
//     const hoisted: AnyBlock[] = [];

//     for (const child of children) {
//       const childType = child.type as string;
//       const childContent = (child[childType] ?? {}) as AnyBlock;
//       const grandchildren = childContent.children as AnyBlock[] | undefined;

//       if (!grandchildren || grandchildren.length === 0) {
//         fixedChildren.push(child);
//         continue;
//       }

//       const strippedChildContent = { ...childContent };
//       delete strippedChildContent.children;
//       fixedChildren.push({ ...child, [childType]: strippedChildContent });
//       hoisted.push(...stripChildrenRecursively(grandchildren));
//     }

//     result.push({ ...block, [blockType]: { ...blockContent, children: fixedChildren } });
//     result.push(...hoisted);
//   }
//   return result;
// }

// function buildBodyBlocks(body: string): AnyBlock[] {
//   if (!body.trim()) return [];
//   try {
//     const blocks = markdownToBlocks(body) as unknown as AnyBlock[];
//     return flattenBodyBlocks(blocks);
//   } catch {
//     return [{
//       object: "block",
//       type: "paragraph",
//       paragraph: {
//         rich_text: [{ type: "text", text: { content: body.slice(0, 2000) } }],
//       },
//     }];
//   }
// }

// function buildToggleBlock(title: string, bodyBlocks: AnyBlock[]): AnyBlock {
//   return {
//     object: "block",
//     type: "toggle",
//     toggle: {
//       rich_text: [{
//         type: "text",
//         text: { content: title.slice(0, 2000) },
//         annotations: { bold: true },
//       }],
//       color: "default",
//       children: bodyBlocks.slice(0, 99),
//     },
//   };
// }

// function buildHeading2Block(text: string): AnyBlock {
//   return {
//     object: "block",
//     type: "heading_2",
//     heading_2: {
//       rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }],
//       color: "default",
//       is_toggleable: false,
//     },
//   };
// }

// export async function createNotionPageWithToggles(
//   title: string,
//   markdown: string,
//   headingLevel?: "##" | "###"
// ) {
//   const notionToken =
//     process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";
//   const notionDatabaseId =
//     process.env.NOTION_DATABASE_ID ||
//     process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ||
//     "";

//   if (!notionToken) throw new Error("Missing NOTION_TOKEN.");
//   if (!notionDatabaseId) throw new Error("Missing NOTION_DATABASE_ID.");

//   const notion = new Client({ auth: notionToken });
//   const cleanMd = stripOuterFence((markdown || "").trim());

//   // ── TECHSTACK MODE: ## Tech heading + ### Topic toggles ──────────────────
//   // Auto-detect: if markdown has both ## and ### headings, use techstack structure
//   const hasTechHeadings = /^## /m.test(cleanMd);
//   const hasTopicHeadings = /^### /m.test(cleanMd);

//   if ((headingLevel === "###" || (hasTechHeadings && hasTopicHeadings))) {
//     const allBlocks: AnyBlock[] = [];

//     // Parse ## Tech sections
//     const techSections = parseSections(cleanMd, "## ");

//     for (const techSection of techSections) {
//       // Add ## Tech as a bold heading_2
//       allBlocks.push(buildHeading2Block(techSection.title));

//       // Parse ### Topic sections within each tech body
//       const topicSections = parseSections(techSection.body, "### ");

//       if (topicSections.length > 0) {
//         // Each topic becomes a toggle
//         for (const topic of topicSections) {
//           const bodyBlocks = buildBodyBlocks(topic.body);
//           allBlocks.push(buildToggleBlock(topic.title, bodyBlocks));
//         }
//       } else {
//         // No ### found, treat entire body as one toggle
//         const bodyBlocks = buildBodyBlocks(techSection.body);
//         if (bodyBlocks.length > 0) {
//           allBlocks.push(buildToggleBlock(techSection.title, bodyBlocks));
//         }
//       }
//     }

//     const chunks = chunkArray(allBlocks, 100);
//     const pageTitle = (title || "Untitled").slice(0, 200);

//     const response = await withNotionWriteRetry("pages.create(techstack)", () =>
//       notion.pages.create({
//         parent: { database_id: notionDatabaseId },
//         properties: {
//           Name: { title: [{ text: { content: pageTitle } }] },
//         },
//         children: chunks[0] as Parameters<Client["pages"]["create"]>[0]["children"],
//       })
//     );

//     for (let i = 1; i < chunks.length; i++) {
//       await withNotionWriteRetry(`blocks.children.append(chunk ${i})`, () =>
//         notion.blocks.children.append({
//           block_id: response.id,
//           children: chunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
//         })
//       );
//     }

//     return response;
//   }

//   // ── STANDARD MODE: ## Topic toggles (drilldown / answers) ───────────────
//   const headingPrefix = headingLevel ? headingLevel + " " : "## ";
//   let sections = parseSections(cleanMd, headingPrefix);

//   if (sections.length === 0) {
//     sections = [{ title: title, body: cleanMd }];
//   }

//   const toggleBlocks: AnyBlock[] = sections.map((sec) =>
//     buildToggleBlock(sec.title, buildBodyBlocks(sec.body))
//   );

//   const topChunks = chunkArray(toggleBlocks, 100);
//   const pageTitle = (title || "Untitled").slice(0, 200);

//   const response = await withNotionWriteRetry("pages.create(toggles)", () =>
//     notion.pages.create({
//       parent: { database_id: notionDatabaseId },
//       properties: {
//         Name: { title: [{ text: { content: pageTitle } }] },
//       },
//       children: topChunks[0] as Parameters<Client["pages"]["create"]>[0]["children"],
//     })
//   );

//   for (let i = 1; i < topChunks.length; i++) {
//     await withNotionWriteRetry(`blocks.children.append(toggle chunk ${i})`, () =>
//       notion.blocks.children.append({
//         block_id: response.id,
//         children: topChunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
//       })
//     );
//   }

//   return response;
// }


import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { withNotionWriteRetry } from "./notionClientRetry";

type AnyBlock = Record<string, unknown>;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function stripOuterFence(md: string) {
  let out = md.trim();
  if (/^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out)) {
    out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    out = out.replace(/\n```$/, "");
  }
  return out.trim();
}

function parseSections(
  markdown: string,
  headingPrefix: string
): Array<{ title: string; body: string }> {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");
  const sections: Array<{ title: string; body: string }> = [];
  let currentTitle = "";
  let currentBodyLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(headingPrefix) && !line.startsWith(headingPrefix + "#")) {
      if (currentTitle) {
        sections.push({ title: currentTitle, body: currentBodyLines.join("\n").trim() });
      }
      currentTitle = line.replace(/^#{1,6}\s+/, "").trim();
      currentBodyLines = [];
    } else {
      currentBodyLines.push(line);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, body: currentBodyLines.join("\n").trim() });
  }

  return sections;
}

function stripChildrenRecursively(blocks: AnyBlock[]): AnyBlock[] {
  const flattened: AnyBlock[] = [];
  for (const block of blocks) {
    const blockType = block.type as string;
    const blockContent = (block[blockType] ?? {}) as AnyBlock;
    const children = blockContent.children as AnyBlock[] | undefined;
    if (!children || children.length === 0) {
      flattened.push(block);
      continue;
    }
    const strippedContent = { ...blockContent };
    delete strippedContent.children;
    flattened.push({ ...block, [blockType]: strippedContent });
    flattened.push(...stripChildrenRecursively(children));
  }
  return flattened;
}

function flattenBodyBlocks(blocks: AnyBlock[], depth = 0): AnyBlock[] {
  const result: AnyBlock[] = [];
  for (const block of blocks) {
    const blockType = block.type as string;
    const blockContent = (block[blockType] ?? {}) as AnyBlock;
    const children = blockContent.children as AnyBlock[] | undefined;

    if (!children || children.length === 0) {
      result.push(block);
      continue;
    }

    if (depth >= 1) {
      const strippedContent = { ...blockContent };
      delete strippedContent.children;
      result.push({ ...block, [blockType]: strippedContent });
      result.push(...stripChildrenRecursively(children));
      continue;
    }

    const fixedChildren: AnyBlock[] = [];
    const hoisted: AnyBlock[] = [];

    for (const child of children) {
      const childType = child.type as string;
      const childContent = (child[childType] ?? {}) as AnyBlock;
      const grandchildren = childContent.children as AnyBlock[] | undefined;

      if (!grandchildren || grandchildren.length === 0) {
        fixedChildren.push(child);
        continue;
      }

      const strippedChildContent = { ...childContent };
      delete strippedChildContent.children;
      fixedChildren.push({ ...child, [childType]: strippedChildContent });
      hoisted.push(...stripChildrenRecursively(grandchildren));
    }

    result.push({ ...block, [blockType]: { ...blockContent, children: fixedChildren } });
    result.push(...hoisted);
  }
  return result;
}

function buildBodyBlocks(body: string): AnyBlock[] {
  if (!body.trim()) return [];
  try {
    const blocks = markdownToBlocks(body) as unknown as AnyBlock[];
    return flattenBodyBlocks(blocks);
  } catch {
    return [{
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: body.slice(0, 2000) } }],
      },
    }];
  }
}

function buildToggleBlock(title: string, bodyBlocks: AnyBlock[]): AnyBlock {
  return {
    object: "block",
    type: "toggle",
    toggle: {
      rich_text: [{
        type: "text",
        text: { content: title.slice(0, 2000) },
        annotations: { bold: true },
      }],
      color: "default",
      children: bodyBlocks.slice(0, 99),
    },
  };
}

function buildHeading2Block(text: string): AnyBlock {
  return {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }],
      color: "default",
      is_toggleable: false,
    },
  };
}

async function appendBlocksToPage(
  notion: Client,
  pageId: string,
  allBlocks: AnyBlock[]
) {
  const chunks = chunkArray(allBlocks, 100);
  const response = await withNotionWriteRetry("pages.create", () =>
    notion.pages.create({
      parent: {
        database_id:
          process.env.NOTION_DATABASE_ID ||
          process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ||
          "",
      },
      properties: { Name: { title: [] } }, // placeholder, caller sets title
      children: chunks[0] as Parameters<Client["pages"]["create"]>[0]["children"],
    })
  );
  for (let i = 1; i < chunks.length; i++) {
    await withNotionWriteRetry(`blocks.children.append(chunk ${i})`, () =>
      notion.blocks.children.append({
        block_id: pageId,
        children: chunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
      })
    );
  }
  return response;
}

// ─── public API ───────────────────────────────────────────────────────────────
export async function createNotionPageWithToggles(
  title: string,
  markdown: string,
  headingLevel?: "##" | "###",
  mode?: "techstack" | "drilldown" | "answers"
) {
  const notionToken =
    process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";
  const notionDatabaseId =
    process.env.NOTION_DATABASE_ID ||
    process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ||
    "";

  if (!notionToken) throw new Error("Missing NOTION_TOKEN.");
  if (!notionDatabaseId) throw new Error("Missing NOTION_DATABASE_ID.");

  const notion = new Client({ auth: notionToken });
  const cleanMd = stripOuterFence((markdown || "").trim());
  const pageTitle = (title || "Untitled").slice(0, 200);

  // ── TECHSTACK MODE: ## Tech heading_2 + ### Topic toggles ────────────────
  if (mode === "techstack") {
    const allBlocks: AnyBlock[] = [];
    const techSections = parseSections(cleanMd, "## ");

    for (const techSection of techSections) {
      allBlocks.push(buildHeading2Block(techSection.title));
      const topicSections = parseSections(techSection.body, "### ");

      if (topicSections.length > 0) {
        for (const topic of topicSections) {
          allBlocks.push(buildToggleBlock(topic.title, buildBodyBlocks(topic.body)));
        }
      } else if (techSection.body.trim()) {
        allBlocks.push(buildToggleBlock(techSection.title, buildBodyBlocks(techSection.body)));
      }
    }

    const chunks = chunkArray(allBlocks, 100);
    const response = await withNotionWriteRetry("pages.create(techstack)", () =>
      notion.pages.create({
        parent: { database_id: notionDatabaseId },
        properties: { Name: { title: [{ text: { content: pageTitle } }] } },
        children: chunks[0] as Parameters<Client["pages"]["create"]>[0]["children"],
      })
    );

    for (let i = 1; i < chunks.length; i++) {
      await withNotionWriteRetry(`blocks.children.append(chunk ${i})`, () =>
        notion.blocks.children.append({
          block_id: response.id,
          children: chunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
        })
      );
    }

    return response;
  }

  // ── ANSWERS MODE: ### Question toggles ───────────────────────────────────
  if (mode === "answers") {
    const sections = parseSections(cleanMd, "### ");
    const toggleBlocks: AnyBlock[] = sections.length > 0
      ? sections.map((sec) => buildToggleBlock(sec.title, buildBodyBlocks(sec.body)))
      : [buildToggleBlock(title, buildBodyBlocks(cleanMd))];

    const chunks = chunkArray(toggleBlocks, 100);
    const response = await withNotionWriteRetry("pages.create(answers)", () =>
      notion.pages.create({
        parent: { database_id: notionDatabaseId },
        properties: { Name: { title: [{ text: { content: pageTitle } }] } },
        children: chunks[0] as Parameters<Client["pages"]["create"]>[0]["children"],
      })
    );

    for (let i = 1; i < chunks.length; i++) {
      await withNotionWriteRetry(`blocks.children.append(chunk ${i})`, () =>
        notion.blocks.children.append({
          block_id: response.id,
          children: chunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
        })
      );
    }

    return response;
  }

  // ── DRILLDOWN MODE (default): ## Topic toggles ────────────────────────────
  const headingPrefix = headingLevel ? headingLevel + " " : "## ";
  let sections = parseSections(cleanMd, headingPrefix);

  if (sections.length === 0) {
    sections = [{ title, body: cleanMd }];
  }

  const toggleBlocks: AnyBlock[] = sections.map((sec) =>
    buildToggleBlock(sec.title, buildBodyBlocks(sec.body))
  );

  const topChunks = chunkArray(toggleBlocks, 100);
  const response = await withNotionWriteRetry("pages.create(drilldown)", () =>
    notion.pages.create({
      parent: { database_id: notionDatabaseId },
      properties: { Name: { title: [{ text: { content: pageTitle } }] } },
      children: topChunks[0] as Parameters<Client["pages"]["create"]>[0]["children"],
    })
  );

  for (let i = 1; i < topChunks.length; i++) {
    await withNotionWriteRetry(`blocks.children.append(toggle chunk ${i})`, () =>
      notion.blocks.children.append({
        block_id: response.id,
        children: topChunks[i] as Parameters<Client["blocks"]["children"]["append"]>[0]["children"],
      })
    );
  }

  return response;
}
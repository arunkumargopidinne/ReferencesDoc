import { NextResponse } from "next/server";
import { createAssignmentNotionPage } from "../../../src/lib/notionAssignment";
import { getNotionErrorStatus } from "../../../src/lib/notionClientRetry";

function getStringProp(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export async function POST(req: Request) {
  const notionToken =
    process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN || "";

  try {
    if (!notionToken) {
      return NextResponse.json(
        { error: "Server misconfiguration: NOTION_TOKEN is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { title, markdown } = body ?? {};

    if (!title || !markdown) {
      return NextResponse.json(
        { error: "Missing title or markdown" },
        { status: 400 }
      );
    }

    const notionRes = await createAssignmentNotionPage(title, markdown);
    const notionId = getStringProp(notionRes, "id");
    const fallbackUrl = notionId
      ? `https://www.notion.so/${notionId.replace(/-/g, "")}`
      : "";
    const url = getStringProp(notionRes, "url") || fallbackUrl;
    const publicUrl = getStringProp(notionRes, "public_url");
    const preferredUrl = publicUrl || url;

    return NextResponse.json({
      id: notionId,
      url,
      publicUrl,
      preferredUrl,
      raw: notionRes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const notionStatus = getNotionErrorStatus(err);
    const status =
      typeof notionStatus === "number" &&
      notionStatus >= 400 &&
      notionStatus <= 599
        ? notionStatus
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

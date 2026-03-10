import { NextResponse } from "next/server";
import { createNotionPageWithToggles } from "../../../src/lib/notionToggle";
import { getNotionErrorStatus } from "../../../src/lib/notionClientRetry";

function getStringProp(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, markdown, headingLevel } = body ?? {};

    if (!title || !markdown) {
      return NextResponse.json(
        { error: "Missing title or markdown" },
        { status: 400 }
      );
    }

    const level: "##" | "###" | undefined =
      headingLevel === "###"
        ? "###"
        : headingLevel === "##"
        ? "##"
        : undefined;

    const notionRes = await createNotionPageWithToggles(title, markdown, level);

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

    console.error("create-notion-toggles error:", {
      message,
      notionStatus,
    });

    return NextResponse.json({ error: message }, { status });
  }
}

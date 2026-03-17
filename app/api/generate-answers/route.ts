import { NextResponse } from "next/server";
import { callOpenAI } from "../../../src/lib/openai";
import {
  GENERATE_ANSWERS_SYSTEM,
  buildGenerateAnswersPrompt,
} from "../../../src/lib/prompts";

export const runtime = "nodejs";

type Body = {
  companyName?: string;
  questions: string | string[];
  chunkSize?: number;
};

function stripQuestionNumberPrefix(question: string): string {
  return question.replace(/^\s*\d+[\).\]-]\s*/, "").trim();
}

function normalizeQuestions(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input
      .map((q) => stripQuestionNumberPrefix(String(q)))
      .filter(Boolean);
  }

  const lines = String(input)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const joined = lines.join("\n");
  const numbered = joined
    .split(/\n(?=\d+[\).\]]\s+)/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return (numbered.length >= 2 ? numbered : lines)
    .map(stripQuestionNumberPrefix)
    .filter(Boolean);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function stripOuterFence(text: string): string {
  let out = text.trim();
  const hasOuterFence =
    /^```(?:markdown|md|text)?\s*\n/i.test(out) && /\n```$/.test(out);

  if (hasOuterFence) {
    out = out.replace(/^```(?:markdown|md|text)?\s*\n/i, "");
    out = out.replace(/\n```$/, "");
  }

  return out.trim();
}

function normalizeAnswerChunk(text: string): string {
  let cleaned = stripOuterFence(text || "");
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/^##(?!#)\s+/gm, "### ");
  cleaned = cleaned.replace(/^###\s+\d+[\).\]-]\s+/gm, "### ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { companyName, questions, chunkSize } = body;

    if (!questions) {
      return NextResponse.json({ error: "Missing questions" }, { status: 400 });
    }

    const qList = normalizeQuestions(questions);
    if (!qList.length) {
      return NextResponse.json({ error: "No valid questions" }, { status: 400 });
    }

    const size = Math.max(1, Math.min(Number(chunkSize) || 4, 10));
    const chunks = chunkArray(qList, size);
    const parts: string[] = [];

    for (let i = 0; i < chunks.length; i += 1) {
      const chunkQuestions = chunks[i];
      const prompt = buildGenerateAnswersPrompt(
        companyName || "",
        chunkQuestions,
        i,
        chunks.length
      );

      const content = await callOpenAI(
        [
          { role: "system", content: GENERATE_ANSWERS_SYSTEM },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2, max_tokens: 4000 }
      );

      const normalized = normalizeAnswerChunk(content || "");
      if (normalized) {
        parts.push(normalized);
      }
    }

    const markdown = parts.join("\n\n").trim();
    if (!markdown) {
      return NextResponse.json(
        { error: "Model returned empty answer content" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      markdown,
      meta: {
        totalQuestions: qList.length,
        chunkSize: size,
        chunks: chunks.length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("generate-answers: unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


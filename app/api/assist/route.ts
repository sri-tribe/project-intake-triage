import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai-config";
import { completeUserPrompt } from "@/lib/openai-chat";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";

  if (!prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured. Set OPENAI_API_KEY in your environment." },
      { status: 503 },
    );
  }

  try {
    const suggestion = await completeUserPrompt(prompt);
    return NextResponse.json({ suggestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

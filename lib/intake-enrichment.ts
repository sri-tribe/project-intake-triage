import type { Intake } from "@prisma/client";
import { aiConfig, isAiConfigured } from "@/lib/ai-config";
import { getPrisma } from "@/lib/prisma";
import { parseIntakeAiPayload, type IntakeAiPayload } from "@/lib/intake-ai-payload";
import { completeJsonObject } from "@/lib/openai-chat";

const ENRICHMENT_SYSTEM = `Given a project intake, output JSON with exactly these keys:
- "summary": string, 2–3 sentences describing the intake for a reviewer.
- "tags": array of exactly 3 short labels (1–3 words each), lowercase where natural.
- "riskChecklist": array of strings, each one concise bullet text (no leading bullets in the string) covering plausible delivery/scope/stakeholder risks.

Do not include any keys other than summary, tags, riskChecklist.`;

export type EnrichmentResult =
  | { ok: true; payload: IntakeAiPayload }
  | { ok: false; error: string };

export async function enrichIntakeRecord(intake: Intake): Promise<EnrichmentResult> {
  if (!isAiConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not set" };
  }

  const userBlock = [
    `Title: ${intake.title}`,
    `Description: ${intake.description || "(none)"}`,
    `Budget range: ${intake.budgetRange || "(none)"}`,
    `Timeline: ${intake.timeline || "(none)"}`,
    `Industry: ${intake.industry || "(none)"}`,
  ].join("\n");

  let rawJson: string;
  try {
    rawJson = await completeJsonObject(ENRICHMENT_SYSTEM, userBlock);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "OpenAI request failed" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson) as unknown;
  } catch {
    return { ok: false, error: "Model returned invalid JSON" };
  }

  const payload = parseIntakeAiPayload(parsed);
  if (!payload) {
    return { ok: false, error: "Model JSON did not match expected shape" };
  }

  return { ok: true, payload };
}

/** Writes or replaces AI metadata when enrichment succeeded. No-op on failure. */
export async function persistIntakeEnrichmentResult(
  intakeId: string,
  result: EnrichmentResult,
): Promise<void> {
  if (!result.ok) return;
  await getPrisma().intakeAiMetadata.upsert({
    where: { intakeId },
    create: {
      intakeId,
      payload: result.payload as object,
      model: aiConfig.model,
    },
    update: {
      payload: result.payload as object,
      model: aiConfig.model,
      createdAt: new Date(),
    },
  });
}

import { enrichIntakeRecord, persistIntakeEnrichmentResult } from "@/lib/intake-enrichment";
import { getPrisma } from "@/lib/prisma";

/**
 * Loads latest intake row, runs LLM enrichment, persists metadata. Safe to run after HTTP response.
 */
export async function runIntakeEnrichmentJob(intakeId: string): Promise<void> {
  const intake = await getPrisma().intake.findUnique({ where: { id: intakeId } });
  if (!intake) {
    console.warn("[enrichment] intake not found", intakeId);
    return;
  }

  const result = await enrichIntakeRecord(intake);
  await persistIntakeEnrichmentResult(intakeId, result);

  if (!result.ok) {
    console.warn("[enrichment] failed", intakeId, result.error);
  }
}

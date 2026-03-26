import { after } from "next/server";
import { runIntakeEnrichmentJob } from "@/lib/enrichment-job";

/** Run enrichment after the response is sent (Next.js request lifecycle). */
export function scheduleIntakeEnrichment(intakeId: string): void {
  after(() => {
    void runIntakeEnrichmentJob(intakeId).catch((err) => {
      console.error("[enrichment] unexpected error", intakeId, err);
    });
  });
}

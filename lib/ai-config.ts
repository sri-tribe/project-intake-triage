/**
 * AI settings from environment. Set OPENAI_API_KEY in `.env` (never commit it).
 */
export const aiConfig = {
  apiKey: process.env.OPENAI_API_KEY?.trim() || "",
  /** Fast, low-cost model; override with OPENAI_MODEL if needed */
  model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  /**
   * Used if the primary model fails after retries (rate limits, 5xx, timeouts).
   * Defaults to gpt-4o-mini; set OPENAI_FALLBACK_MODEL to match primary to disable fallback.
   */
  fallbackModel: process.env.OPENAI_FALLBACK_MODEL?.trim() || "gpt-4o-mini",
} as const;

export function isAiConfigured(): boolean {
  return aiConfig.apiKey.length > 0;
}

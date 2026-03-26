export type IntakeAiPayload = {
  summary: string;
  tags: string[];
  riskChecklist: string[];
};

export function parseIntakeAiPayload(raw: unknown): IntakeAiPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (!summary) return null;

  const tagsRaw = Array.isArray(o.tags) ? o.tags : [];
  const tags = tagsRaw
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);

  const riskRaw = Array.isArray(o.riskChecklist) ? o.riskChecklist : [];
  const riskChecklist = riskRaw
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean);

  if (riskChecklist.length === 0) return null;
  if (tags.length === 0) return null;

  return {
    summary,
    tags: tags.slice(0, 3),
    riskChecklist,
  };
}

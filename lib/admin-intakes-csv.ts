import { toCsvLine } from "@/lib/csv";

export type AdminIntakeCsvRow = {
  id: string;
  title: string;
  industry: string;
  createdAtIso: string;
  user: { id: string; name: string; email: string };
};

const HEADERS = [
  "intake_id",
  "title",
  "submitted_by_name",
  "submitted_by_email",
  "submitter_user_id",
  "industry",
  "created_at_iso",
] as const;

/** Build CSV text (no BOM). Empty `rows` yields a header-only file. */
export function buildAdminIntakesCsv(rows: AdminIntakeCsvRow[]): string {
  const lines: string[] = [toCsvLine([...HEADERS])];
  for (const row of rows) {
    lines.push(
      toCsvLine([
        row.id,
        row.title,
        row.user.name,
        row.user.email,
        row.user.id,
        row.industry,
        row.createdAtIso,
      ]),
    );
  }
  return lines.join("\r\n");
}

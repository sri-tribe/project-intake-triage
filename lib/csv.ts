/** RFC 4180–style CSV field escaping for export downloads. */
export function escapeCsvField(value: string): string {
  const s = value ?? "";
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsvLine(fields: string[]): string {
  return fields.map(escapeCsvField).join(",");
}

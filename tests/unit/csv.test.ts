import { escapeCsvField, toCsvLine } from "@/lib/csv";
import { describe, expect, it } from "vitest";

describe("csv export helpers", () => {
  it("escapes commas, quotes, and newlines", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("leaves simple values unquoted", () => {
    expect(escapeCsvField("hello")).toBe("hello");
    expect(escapeCsvField("")).toBe("");
  });

  it("joins a row with escaping", () => {
    expect(toCsvLine(["id", "title, with comma"])).toBe('id,"title, with comma"');
  });
});

import { describe, expect, it } from "vitest";

describe("production session secret", () => {
  it("SESSION_SECRET must be at least 32 characters when NODE_ENV is production", () => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    const secret = process.env.SESSION_SECRET?.trim() ?? "";
    expect(secret.length, "Set SESSION_SECRET to a random string of at least 32 characters in production").toBeGreaterThanOrEqual(
      32,
    );
  });
});

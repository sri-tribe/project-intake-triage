import { isRetriableHttpStatus, retryDelayMs } from "@/lib/openai-retry";
import { describe, expect, it } from "vitest";

describe("OpenAI retry helpers", () => {
  it("treats rate limits and server errors as retriable", () => {
    expect(isRetriableHttpStatus(429)).toBe(true);
    expect(isRetriableHttpStatus(500)).toBe(true);
    expect(isRetriableHttpStatus(503)).toBe(true);
    expect(isRetriableHttpStatus(529)).toBe(true);
  });

  it("does not retry client errors", () => {
    expect(isRetriableHttpStatus(400)).toBe(false);
    expect(isRetriableHttpStatus(401)).toBe(false);
    expect(isRetriableHttpStatus(404)).toBe(false);
  });

  it("caps exponential backoff", () => {
    expect(retryDelayMs(0, 100, 250)).toBe(100);
    expect(retryDelayMs(10, 100, 500)).toBe(500);
  });
});

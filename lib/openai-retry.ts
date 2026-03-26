/** HTTP statuses where a retry may succeed (rate limits, server/load errors). */
export function isRetriableHttpStatus(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 529
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Delay before attempt `attemptIndex` (0-based), exponential backoff with cap. */
export function retryDelayMs(attemptIndex: number, baseMs: number, maxMs: number): number {
  const exp = baseMs * Math.pow(2, attemptIndex);
  return Math.min(exp, maxMs);
}

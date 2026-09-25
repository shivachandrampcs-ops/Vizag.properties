/**
 * Tiny in-process rate limiter.
 *
 * Enough to stop a single authenticated account from hammering the upload
 * endpoint (upload abuse). It is per-instance; for a multi-instance cluster,
 * move the counter to Redis — the call sites do not need to change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((bucket.resetAt - now) / 1000)
  );

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Opportunistic cleanup so the map cannot grow without bound. */
if (typeof setInterval === "function") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 5 * 60 * 1000);
  // Do not keep the Node process alive just for this timer.
  (timer as unknown as { unref?: () => void }).unref?.();
}

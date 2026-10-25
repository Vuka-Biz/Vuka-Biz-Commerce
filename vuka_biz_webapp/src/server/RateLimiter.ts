export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfterSeconds: number };

type Bucket = { tokens: number; updatedAt: number };

/**
 * Token bucket per key: bursts up to `capacity`, then `refillPerSecond`.
 *
 * State lives in this server instance's memory, so each instance limits on its
 * own. That stops floods and brute force per instance; a strict global quota
 * would need a shared store (Firestore counter or the edge provider's limiter).
 */
export class RateLimiter {
  private static readonly MAX_KEYS = 10_000;

  private readonly buckets = new Map<string, Bucket>();

  constructor(
    readonly capacity: number,
    readonly refillPerSecond: number,
  ) {}

  take(key: string, now = Date.now()): RateLimitResult {
    const bucket = this.refill(key, now);
    if (bucket.tokens < 1) {
      return { ok: false, retryAfterSeconds: Math.ceil((1 - bucket.tokens) / this.refillPerSecond) };
    }
    bucket.tokens -= 1;
    return { ok: true, remaining: Math.floor(bucket.tokens) };
  }

  private refill(key: string, now: number): Bucket {
    const existing = this.buckets.get(key);
    if (existing) {
      const elapsed = (now - existing.updatedAt) / 1000;
      existing.tokens = Math.min(this.capacity, existing.tokens + elapsed * this.refillPerSecond);
      existing.updatedAt = now;
      return existing;
    }
    if (this.buckets.size >= RateLimiter.MAX_KEYS) this.prune(now);
    const bucket = { tokens: this.capacity, updatedAt: now };
    this.buckets.set(key, bucket);
    return bucket;
  }

  /** Drops buckets that have refilled completely – they carry no state. */
  private prune(now: number): void {
    const fullAfterMs = (this.capacity / this.refillPerSecond) * 1000;
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.updatedAt >= fullAfterMs) this.buckets.delete(key);
    }
    // Still full of active keys (e.g. a spoofed-IP flood): start over rather than grow without bound.
    if (this.buckets.size >= RateLimiter.MAX_KEYS) this.buckets.clear();
  }
}

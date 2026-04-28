// In-memory fixed-window rate limiter. Each serverless instance maintains its own
// Map, so limits are enforced per-instance rather than globally across all instances.
// This provides best-effort throttling; for strict distributed enforcement use a
// shared store (e.g. Upstash Redis via Vercel KV).

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export function rateLimit(key: string, limit: number, windowSecs: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSecs * 1000;
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// Prune expired entries once per minute. Guarded by a module-level flag so HMR
// re-evaluations and parallel builds don't stack up duplicate timers. unref()
// prevents this timer from keeping the Node.js event loop alive.
if (!(globalThis as Record<string, unknown>).__rateLimitPruneStarted) {
  (globalThis as Record<string, unknown>).__rateLimitPruneStarted = true;
  const handle = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.windowStart >= 60_000) store.delete(key);
    }
  }, 60_000);
  (handle as unknown as { unref?: () => void }).unref?.();
}

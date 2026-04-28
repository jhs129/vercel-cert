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

// Periodically prune expired entries to prevent unbounded Map growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart >= 60_000) store.delete(key);
  }
}, 60_000);

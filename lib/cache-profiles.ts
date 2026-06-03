import "server-only";

/**
 * Base revalidation window in seconds.
 * Set CACHE_REVALIDATE_SECONDS env var to override (default: 300 = 5 minutes).
 *
 * All cache tiers scale from this value:
 *   short  — 1× base stale,   2× revalidate,   12× expire   (trending, browse)
 *   medium — 12× stale,      24× revalidate,   48× expire   (articles)
 *   long   — 288× stale,    576× revalidate, 2016× expire   (categories, footer, blur)
 *   search — base/5 stale, base×2/5 revalidate, base expire (search results)
 *
 * Example: CACHE_REVALIDATE_SECONDS=60 gives 1-minute base for local dev.
 */
const BASE = Math.max(1, parseInt(process.env.CACHE_REVALIDATE_SECONDS ?? "300", 10));

export const cacheProfiles = {
  short: {
    stale: BASE,
    revalidate: BASE * 2,
    expire: BASE * 12,
  },
  medium: {
    stale: BASE * 12,
    revalidate: BASE * 24,
    expire: BASE * 48,
  },
  long: {
    stale: BASE * 288,
    revalidate: BASE * 576,
    expire: BASE * 2016,
  },
  search: {
    stale: Math.max(1, Math.floor(BASE / 5)),
    revalidate: Math.max(1, Math.floor((BASE * 2) / 5)),
    expire: BASE,
  },
} as const;

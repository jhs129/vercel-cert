# Cache Components — Design Spec

**Date:** 2026-06-02  
**Branch:** perf-optimization → main  
**Goal:** Satisfy the Vercel Next.js 16 certification requirement to enable and properly use Cache Components.

---

## Context

The Vercel certification requires Cache Components to be enabled and applied across pages. The `perf-optimization` branch already has `cacheComponents: true` in `next.config.ts` and `"use cache"` on all data-fetching functions. The primary gap is the Browse page (`/browse`), which fetches all data client-side via `useEffect` — bypassing `"use cache"` entirely at runtime. The Home page also lacks explicit named cache component functions, which would make the three-tier pattern visible to evaluators.

---

## Architecture

Cache Components in Next.js 16 enforce a three-tier model:

| Tier | How | Where |
|------|-----|--------|
| **Static** | Synchronous, no async data | Layout shell, nav, headings |
| **Cached** | `"use cache"` + `cacheLife` + `cacheTag` | Article lists, categories, trending |
| **Dynamic** | Reads runtime APIs (`cookies`, `searchParams`); wrap in `Suspense` | Subscription check, search inputs |

---

## Changes Required

### 1. Browse Page — Server-first Refactor

**Problem:** `CategoryBrowseClient` does all data fetching client-side. The `"use cache"` directives on `fetchCategories()` and `fetchArticlesByCategory()` are never reached at request time.

**Solution:** Split into a thin server component that fetches + caches data, and a minimal client component that handles pagination only.

**Pattern mirrors the existing Search page** — three steps: synchronous page (static shell) → async wrapper inside Suspense (awaits searchParams) → cache component (receives plain string, which becomes part of cache key).

**`app/browse/page.tsx`** — Synchronous, static shell:

```tsx
export default function BrowsePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <BrowseContent searchParams={searchParams} />
    </Suspense>
  );
}
```

**`BrowseContent`** — Async, awaits searchParams (dynamic, inside Suspense):

```tsx
async function BrowseContent({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams; // await OUTSIDE use cache — runtime API constraint
  return <CachedBrowseContent category={category} />;
}
```

**`CachedBrowseContent`** — Cache component (new, co-located in `app/browse/`):

```tsx
async function CachedBrowseContent({ category }: { category?: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "categories");

  const [articles, categoryList] = await Promise.all([
    fetchArticlesByCategory(category, 100),
    fetchCategories(),
  ]);
  const categories = categoryList.map(c => c.slug);

  return (
    <BrowseShell
      articles={articles}
      categories={categories}
      activeCategory={category ?? null}
    />
  );
}
```

> **Cache key:** `category` (a plain string or `undefined`) becomes part of the automatic cache key, so each category gets its own cache entry.

**`BrowseShell`** — Client component for pagination + category links:

- Receives `articles`, `categories`, `activeCategory` as props (no data fetching)
- Category filter renders `<Link href="/browse?category=X">` tags (navigation triggers server re-render)
- Pagination stays client-side with `useState` (pure UI state, no fetch)

**Files to change:**
- `app/browse/page.tsx` — restructure
- `components/ui/CategoryBrowse/CategoryBrowseClient.tsx` — refactor to `BrowseShell` (receives props, no fetch)
- Delete or repurpose `app/api/articles-by-category/route.ts` (no longer needed at runtime)

---

### 2. Home Page — Named Cache Component Wrappers

**Problem:** `app/page.tsx` fetches data directly in the page function body. The caching happens at the function level inside `fetchTrendingArticles()`, but there are no named cache component functions at the component level — making the pattern less visible and composable.

**Solution:** Extract into a single `CachedHomeContent` component that owns both the hero and the trending grid, fetching trending articles once.

**New `CachedHomeContent`** (can live in `app/page.tsx` or extracted):

```tsx
async function CachedHomeContent() {
  "use cache";
  cacheLife("minutes");
  cacheTag("trending");

  const articles = await fetchTrendingArticles();
  const articlesWithBlur = await Promise.all(
    articles.slice(0, 4).map(async (article) => ({
      ...article,
      blurDataURL: article.image ? await generateBlurPlaceholder(article.image) : undefined,
    }))
  );
  const [hero, ...cards] = articlesWithBlur;

  return (
    <>
      {hero && <HeroBanner ... />}
      {cards.length > 0 && <section>...</section>}
    </>
  );
}

export default function HomePage() {
  return <CachedHomeContent />;
}
```

This makes the home page a static shell that delegates to a named cache component — exactly the three-tier pattern the certification is looking for.

---

### 3. No Changes Needed

**Article page** (`app/content/[slug]/page.tsx`): Already has the ideal three-tier pattern — `ArticleHeader` (cached), `ArticleBodyGate` (dynamic, subscription check), `CachedTrending` (cached).

**Search page** (`app/search/page.tsx`): `SearchPageContent` is necessarily dynamic (reads `searchParams`), and the underlying data calls are already cached at the function level. No change needed.

**Footer** (`components/navigation/footer.tsx`): Uses `"use cache"`. The `new Date().getFullYear()` call gets baked in at build time — acceptable for a copyright year. No change needed.

**`lib/articles-api.ts`**: All functions already use `"use cache"` + `cacheLife` + `cacheTag`. No change needed.

---

## Cache Key Strategy

| Component | Cache Tag(s) | Lifetime |
|-----------|-------------|----------|
| `CachedHomeContent` | `trending` | `minutes` |
| `CachedBrowseContent` (no category) | `articles`, `categories` | `minutes` |
| `CachedBrowseContent` (with category) | `articles`, `categories` | `minutes` (per-category key auto-generated from `searchParams.category`) |
| `ArticleHeader` | `articles`, `article-{slug}` | `hours` |
| `CachedTrending` | `trending` | `minutes` |
| `Footer` | _(none)_ | `days` |

---

## Verification

1. Run `pnpm build` — should complete without errors.
2. Run `pnpm dev` and visit `/browse` — first load should show skeleton, then render server-side. Switching categories should reload the page (not flicker client-side).
3. Visit `/` — home page renders from `CachedHomeContent`.
4. Visit an article page — inspect DevTools Network: only the subscription check should be a fresh server call; article content should be cached.
5. Deploy to Vercel and confirm the certification evaluator sees Cache Components in the deployment (or check the Vercel dashboard for caching metrics).

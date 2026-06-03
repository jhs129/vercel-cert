# Cache Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Cache Components across all pages to satisfy the Vercel Next.js 16 certification requirement for composable caching.

**Architecture:** `cacheComponents: true` is already set in `next.config.ts` and data-fetching functions are already cached. The remaining work is (1) wrapping the home page in a named `CachedHomeContent` server component so the three-tier pattern is explicit, and (2) restructuring the Browse page from fully client-side to a server-first three-step chain: sync page shell → async wrapper (awaits `searchParams`) → cache component (fetches + renders).

**Tech Stack:** Next.js 16.2.4, React 19, TypeScript, `next/cache` (`cacheLife`, `cacheTag`), pnpm

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/page.tsx` | Modify | Add `CachedHomeContent` as a named `"use cache"` component; `HomePage` becomes a thin shell that returns `<CachedHomeContent />` |
| `app/browse/page.tsx` | Modify | Restructure: sync `BrowsePage` → async `BrowseContent` (awaits `searchParams`) → `CachedBrowseContent` (`"use cache"`, fetches data) |
| `components/ui/CategoryBrowse/BrowseShell.tsx` | Create | Client component that accepts `articles`, `categories`, `activeCategory` as props; owns pagination state only — no data fetching |
| `components/ui/CategoryBrowse/CategoryBrowseClient.tsx` | Delete | Replaced by `BrowseShell.tsx` |

---

## Task 1: Home Page — Named Cache Component

**Files:**
- Modify: `app/page.tsx`

### Why this change

The current `HomePage` calls `fetchTrendingArticles()` directly in the page function body. While that function is cached, there is no named component-level cache boundary. Wrapping the entire home content in `CachedHomeContent` creates an explicit named cache component that the certification evaluates.

- [ ] **Step 1: Rewrite `app/page.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import HeroBanner from "@/components/ui/HeroBanner";
import CardImage from "@/components/ui/CardImage";
import { generateBlurPlaceholder } from "@/lib/image-utils";
import { fetchTrendingArticles } from "@/lib/articles-api";

export const metadata: Metadata = {
  title: "Home",
  description: "The latest news and trending articles.",
  openGraph: {
    title: "Home",
    description: "The latest news and trending articles.",
    siteName: "Vercel News Site",
    url: "/",
    images: [{ url: "/og-image.png" }],
  },
};

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
      {hero && (
        <HeroBanner
          slides={[
            {
              backgroundImage: hero.image,
              headline: hero.title,
              body: hero.excerpt,
              ctaLabel: "Read More",
              ctaHref: `/content/${hero.slug}`,
            },
          ]}
        />
      )}
      {cards.length > 0 && (
        <section className="py-8">
          <h2 className="text-3xl font-bold mb-8">Trending Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((article) => (
              <CardImage
                key={article.id}
                src={article.image}
                alt={article.title}
                headline={article.title}
                slug={article.slug}
                body={article.excerpt}
                blurDataURL={article.blurDataURL}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function HomePage() {
  return <CachedHomeContent />;
}
```

- [ ] **Step 2: Verify build passes**

```bash
pnpm build
```

Expected: Build completes with no errors. If `generateBlurPlaceholder` complaints appear about being called inside a `"use cache"` context, note that it already has its own `"use cache"` directive — nested `"use cache"` calls are fine; each function manages its own cache boundary.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wrap home page content in named CachedHomeContent cache component"
```

---

## Task 2: Browse Page — Server-First Refactor

**Files:**
- Modify: `app/browse/page.tsx`
- Create: `components/ui/CategoryBrowse/BrowseShell.tsx`
- Delete: `components/ui/CategoryBrowse/CategoryBrowseClient.tsx`

### Why this change

The current browse page delegates everything to `CategoryBrowseClient`, which runs `useEffect → fetch('/api/articles-by-category')` on the client. This completely bypasses `"use cache"`. The refactored version uses a three-step chain matching the existing Search page pattern:

1. `BrowsePage` (sync) — static shell, passes searchParams Promise into Suspense
2. `BrowseContent` (async) — awaits `searchParams` inside Suspense (dynamic boundary)
3. `CachedBrowseContent` (async, `"use cache"`) — receives plain `category` string as prop (part of cache key), fetches and renders

### Step 2a: Create `BrowseShell`

- [ ] **Step 2a-1: Create `components/ui/CategoryBrowse/BrowseShell.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Article } from "@/lib/articles-api";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { ArticleHit } from "@/components/ui/ArticleHit";
import SearchEmptyState from "@/components/ui/SearchEmptyState";
import type { Themeable } from "@/lib/types";

const PAGE_SIZE = 10;

interface BrowseShellProps extends Themeable {
  title?: string;
  articles: Article[];
  categories: string[];
  activeCategory: string | null;
}

export default function BrowseShell({
  title = "Browse Articles",
  theme = "light",
  articles,
  categories,
  activeCategory,
}: BrowseShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);

  const handleCategoryChange = (cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const paged = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={`theme-${theme} flex flex-col gap-6 p-6`}>
      {title && <h2>{title}</h2>}

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {paged.length === 0 ? (
        <SearchEmptyState
          query={activeCategory ?? ""}
          onClearSearch={() => handleCategoryChange(null)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {paged.map((article) => (
            <ArticleHit
              key={article.id}
              title={article.title}
              slug={article.slug}
              publishDate={
                article.publishedAt
                  ? new Date(article.publishedAt).getTime()
                  : undefined
              }
              description={article.excerpt}
              categories={article.category ? [article.category] : undefined}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-40 hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-40 hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

**Key differences from `CategoryBrowseClient`:**
- No `useEffect`, no `useReducer`, no `fetch` call
- Receives `articles`, `categories`, `activeCategory` as props
- Pagination is simple `useState(1)` — resets only when category changes (URL navigation resets it naturally)
- Removed `dangerouslySetInnerHTML` on the title (was unsafe; plain text title is sufficient)

### Step 2b: Rewrite the browse page

- [ ] **Step 2b-1: Rewrite `app/browse/page.tsx`**

Replace the entire file with:

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { fetchArticlesByCategory, fetchCategories } from "@/lib/articles-api";
import BrowseShell from "@/components/ui/CategoryBrowse/BrowseShell";

export const metadata: Metadata = {
  title: "Browse Articles",
  description: "Browse and filter articles by category.",
  openGraph: {
    title: "Browse Articles",
    description: "Browse and filter articles by category.",
    siteName: "Vercel News Site",
    url: "/browse",
    images: [{ url: "/og-image.png" }],
  },
};

async function CachedBrowseContent({ category }: { category?: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "categories");

  const [articles, categoryList] = await Promise.all([
    fetchArticlesByCategory(category, 100),
    fetchCategories(),
  ]);

  const categories = [
    ...new Set(
      categoryList.length > 0
        ? categoryList.map((c) => c.slug)
        : articles.flatMap((a) => (a.category ? [a.category] : []))
    ),
  ];

  return (
    <BrowseShell
      title="Browse our Articles"
      articles={articles}
      categories={categories}
      activeCategory={category ?? null}
    />
  );
}

async function BrowseContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <CachedBrowseContent category={category} />;
}

function BrowseSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading browse"
      className="animate-pulse rounded-lg border border-border p-6"
    >
      <div className="h-10 w-48 rounded bg-muted/30 mb-6" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded bg-muted/20" />
        ))}
      </div>
    </div>
  );
}

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <div className="py-8">
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
```

### Step 2c: Delete the old client component

- [ ] **Step 2c-1: Delete `components/ui/CategoryBrowse/CategoryBrowseClient.tsx`**

```bash
rm /Users/johnhschneider/dev/vercel-cert/components/ui/CategoryBrowse/CategoryBrowseClient.tsx
```

- [ ] **Step 2d: Verify build passes**

```bash
pnpm build
```

Expected: Build completes. Watch for any TypeScript errors about missing imports — `CategoryBrowseClient` should have no remaining importers after the page rewrite.

- [ ] **Step 2e: Verify lint passes**

```bash
pnpm lint
```

Expected: No lint errors.

- [ ] **Step 2f: Commit**

```bash
git add app/browse/page.tsx components/ui/CategoryBrowse/BrowseShell.tsx
git rm components/ui/CategoryBrowse/CategoryBrowseClient.tsx
git commit -m "feat: refactor browse page to server-first cache components pattern"
```

---

## Task 3: Manual Verification

- [ ] **Step 3-1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 3-2: Check home page**

Visit `http://localhost:3000`. Confirm the hero banner and trending grid render correctly. The page should look identical to before.

- [ ] **Step 3-3: Check browse page — initial load**

Visit `http://localhost:3000/browse`. You should see the skeleton loading state briefly, then the full article list with category filters.

- [ ] **Step 3-4: Check browse page — category filter**

Click a category filter button. The URL should update to `/browse?category=<slug>`. The article list should update to show only articles in that category. Clicking "All" should return to the full list.

- [ ] **Step 3-5: Check browse page — repeat visit uses cache**

Open DevTools Network tab. Navigate away from `/browse`, then back. The server response should be fast (cached). No client-side fetch to `/api/articles-by-category` should appear in the network tab.

- [ ] **Step 3-6: Check article page is unchanged**

Visit any article (e.g., `http://localhost:3000/content/<slug>`). Confirm the three-tier pattern still works: article header renders, body loads via Suspense, trending sidebar shows.

- [ ] **Step 3-7: Final production build + lint**

```bash
pnpm build && pnpm lint
```

Expected: Zero errors. Zero lint warnings that weren't there before.

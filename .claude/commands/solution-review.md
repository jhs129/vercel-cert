# Solution Review

Audit this Next.js 16 / Vercel application against the certification rubric. This is an instructional exercise — for every gap found, explain the **why** behind the best practice so the developer understands the pattern, not just the fix. Then interactively decide which gaps to log as Jira bugs.

---

## Evaluation Dimensions

| # | Dimension | What's Checked |
|---|-----------|----------------|
| 1 | **Caching Strategy** | `"use cache"`, `cacheLife`, `cacheTag`; cache vs. dynamic decisions |
| 2 | **Component Architecture** | Server/Client boundaries; minimal, intentional `"use client"` usage |
| 3 | **Suspense & Streaming** | `<Suspense>` boundaries, loading states, fallback UI for dynamic content |
| 4 | **Server Actions & Forms** | Mutations via Server Actions; proper form handling patterns |
| 5 | **Metadata & SEO** | Root + page-level metadata; `generateMetadata`; Open Graph |
| 6 | **Data Fetching Patterns** | Parallel fetching; `generateStaticParams`; proper 404 handling |
| 7 | **Code Quality & Polish** | Clean code; responsive design; error boundaries; end-to-end experience |

---

## Step 1: Audit the Codebase

Explore the repository systematically. Run all searches before forming conclusions.

### 1 — Caching Strategy

```bash
grep -rn "use cache\|cacheLife\|cacheTag\|revalidate\|unstable_cache\|cache()" app/ lib/ --include="*.ts" --include="*.tsx"
```

Look for:
- Is `"use cache"` applied to data-fetching functions in `lib/`?
- Are `cacheLife` / `cacheTag` used to express TTL and invalidation intent?
- Are Builder.io fetch calls instrumented with cache directives, or always dynamic?
- Are user-specific or per-request routes correctly *not* cached?

**What to teach if gaps found:**
In Next.js 16, `"use cache"` is the successor to `fetch` cache options and `unstable_cache`. It turns a function into a cached computation whose result is stored on the server. `cacheLife` sets expiry (e.g. `cacheLife("hours")`). `cacheTag` lets you invalidate groups of cached results with `revalidateTag()`. The pattern is: cache the expensive, shared, rarely-changing data (CMS content, article lists); keep dynamic data (user sessions, real-time counts) uncached.

---

### 2 — Component Architecture

```bash
grep -rn '"use client"' app/ components/ --include="*.tsx"
grep -rn '"use server"' app/ --include="*.ts" --include="*.tsx"
```

Also read `app/layout.tsx` and each `app/*/page.tsx`.

Look for:
- Are `page.tsx` files async Server Components that fetch data and pass it as props?
- Is `"use client"` only on components that need browser APIs, event handlers, or React state?
- Are there any `"use client"` components that contain data fetching that could move to the server?
- Is the server/client split pattern (`page.tsx` → `*Client.tsx`) applied consistently?

**What to teach if gaps found:**
Server Components run only on the server — they can `await` database calls, read env vars, and never ship their code to the browser. `"use client"` creates a boundary: everything below it runs in the browser. The goal is to push that boundary as far down the tree as possible. A common mistake is marking a whole page `"use client"` because one interactive element needs it — instead, extract just the interactive piece into a `*Client.tsx` component and keep the page as a Server Component.

---

### 3 — Suspense & Streaming

```bash
grep -rn "Suspense" app/ components/ --include="*.tsx"
find /Users/johnhschneider/dev/vercel-cert/app -name "loading.tsx"
find /Users/johnhschneider/dev/vercel-cert/app -name "error.tsx"
```

Look for:
- Are async Server Components wrapped in `<Suspense fallback={...}>` at their use sites?
- Are there `loading.tsx` files for route-level streaming?
- Do dynamic components (Builder.io content, search results) show skeleton/fallback UI during load?
- Are `<Suspense>` boundaries granular (per-section) or only at the route level?

**What to teach if gaps found:**
Streaming lets the browser start rendering a page before all the data is ready. Each `<Suspense>` boundary is a "seam" — Next.js flushes the static shell immediately and streams each boundary's content as it resolves. `loading.tsx` is syntactic sugar that wraps the page in a `<Suspense>` automatically. Granular boundaries (one per independently-fetchable section) give the best perceived performance, because fast sections appear immediately without waiting for slow ones.

---

### 4 — Server Actions & Forms

```bash
grep -rn '"use server"' app/ --include="*.ts" --include="*.tsx"
grep -rn "action=" app/ --include="*.tsx"
grep -rn "<form" app/ --include="*.tsx"
```

Look for:
- Does the app have any mutation surfaces (contact forms, newsletter signup, search submission)?
- If yes: are they handled via Server Actions (`async function` with `"use server"`)? Or via client-side `fetch`?
- Are forms using `<form action={serverAction}>` or the `useActionState` hook?

**What to teach if gaps found:**
Server Actions are async functions marked `"use server"` that run exclusively on the server. They can be passed directly as a `<form action>` — meaning the form works even before JavaScript loads (progressive enhancement). Client-side `fetch` to an API route works too, but it requires more boilerplate, doesn't get the progressive enhancement, and adds an extra round-trip. For a read-only app with no mutations, this dimension is N/A — note that clearly rather than calling it a gap.

---

### 5 — Metadata & SEO

```bash
grep -rn "generateMetadata\|export const metadata" app/ --include="*.tsx" --include="*.ts"
grep -rn "openGraph\|twitter\|canonical\|metadataBase" app/ --include="*.tsx" --include="*.ts"
```

Look for:
- Is there a root `metadata` export in `layout.tsx` with title, description, OG image, and `metadataBase`?
- Do dynamic routes (`/content/[slug]`) use `generateMetadata` to pull real article titles/images?
- Is OG data complete: `title`, `description`, `url`, `images`?
- Are Twitter/X card tags present?
- Is `metadataBase` set so relative image URLs resolve correctly?

**What to teach if gaps found:**
`metadata` (static) and `generateMetadata` (dynamic, async) are Next.js's way of injecting `<head>` content. For dynamic pages, `generateMetadata` receives the same `params` as the page and can fetch CMS data to build a rich OG card. The `metadataBase` in the root layout tells Next.js how to resolve relative image paths in metadata — without it, OG image URLs break when shared on social platforms. A complete OG card (title + description + image + url) is the single biggest SEO win per line of code.

---

### 6 — Data Fetching Patterns

```bash
grep -rn "generateStaticParams\|Promise.all\|notFound()" app/ --include="*.tsx" --include="*.ts"
grep -rn "params\b" app/ --include="*.tsx" | grep "async\|await" | head -20
```

Also read each `app/*/page.tsx` to check fetch patterns.

Look for:
- Is `Promise.all` used when multiple independent fetches happen in the same component?
- Is `generateStaticParams` used on `[slug]` routes to pre-render article pages at build time?
- Is `notFound()` called when a fetch returns no content (instead of rendering an empty page)?
- Are `params` properly awaited (Next.js 16 requires `await params`)?

**What to teach if gaps found:**
`Promise.all` runs fetches in parallel — two sequential `await` calls take `A + B` ms, while `Promise.all([fetchA(), fetchB()])` takes `max(A, B)` ms. For a page fetching both article content and alert banners, that's a meaningful win. `generateStaticParams` tells Next.js which dynamic routes to pre-render at build time, turning them from server-rendered on each request into static files served from the edge — orders-of-magnitude faster. `notFound()` is important because it returns a proper 404 response; without it, empty pages silently return 200, which is bad for SEO and user experience.

---

### 7 — Code Quality & Polish

```bash
pnpm lint 2>&1 | head -60
grep -rn "\bany\b" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v "//.*any\|eslint-disable" | head -20
grep -rn "sm:\|md:\|lg:\|xl:" components/ --include="*.tsx" -l
find /Users/johnhschneider/dev/vercel-cert/app -name "error.tsx"
grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(\|rgba(" app/ components/ --include="*.tsx" --include="*.css" | grep -v "globals.css\|shadcn"
```

Look for:
- Does `pnpm lint` pass clean?
- Are there `any` types that should be real interfaces?
- Do components use responsive Tailwind classes (`sm:`, `md:`, `lg:`)?
- Are there `error.tsx` files for route-level error boundaries?
- Are hardcoded hex colors or inline RGB values used instead of CSS tokens?

**What to teach if gaps found:**
Error boundaries (`error.tsx`) prevent one broken route from crashing the whole app — Next.js catches the error and renders the fallback instead of a white screen. `any` types defeat TypeScript's purpose; every `any` is a place where a runtime error can hide. Responsive classes are non-negotiable for a real production app — Tailwind's mobile-first utilities (`sm:grid-cols-2 lg:grid-cols-3`) are the idiomatic way to do this. Hardcoded colors make theming impossible and make global color changes require a grep-and-replace instead of a one-line CSS variable update.

---

## Step 2: Compile and Present Results

After completing all seven sections, present:

1. **A summary table** rating each dimension ✅ Pass / ⚠️ Gap / ❌ Missing
2. **A numbered issue list** — every Gap and Missing item, with:
   - The dimension it belongs to
   - A plain-English title
   - One sentence describing what's wrong
   - One sentence explaining the best-practice fix
   - The specific file(s) involved

Format example:
```
## Audit Results

| # | Dimension | Rating | Summary |
|---|-----------|--------|---------|
| 1 | Caching Strategy | ❌ | No "use cache" applied anywhere |
| 2 | Component Architecture | ✅ | Server/client split consistently applied |
...

## Issues Found

**Issue 1 — Caching Strategy: No cache directives on CMS fetch functions**
📁 `lib/builder.ts`
Builder.io fetch calls have no `"use cache"` directive, so article content is re-fetched on every request. Adding `"use cache"` with `cacheLife("hours")` and `cacheTag("articles")` would let the server cache responses and serve repeat visitors from memory.

**Issue 2 — ...**
```

---

## Step 3: Sequential Jira Triage

Once the issue list is presented, go through it one at a time. For each issue:

1. **Explain it conversationally** — briefly restate the problem and why it matters in the context of the certification rubric
2. **Ask:** `Log this as a Jira bug? (yes / no / skip-rest)`
3. Wait for the user's response before moving to the next issue

Valid responses:
- **yes** → log it, move to next
- **no** → skip it, move to next
- **skip-rest** → stop asking, go straight to the final summary

---

## Step 4: Log Approved Issues as Jira Bugs

For each approved issue:

```
createJiraIssue(
  cloudId="c546b8b8-c5e9-4677-8322-7a935c3d3860",
  projectKey="VS",
  issuetype="Bug",
  summary="[Dimension] <Title>",
  description=<ADF doc with Current State, Expected, and Why It Matters sections>,
  priority="Medium"
)
```

Confirm each one: `✅ Logged VS-<key>: <summary>`

---

## Step 5: Final Summary

```
## Review Complete

Dimensions passing: X/7

### Logged as Jira Issues
- VS-XX — <summary>

### Not logged
- Issue #N — <title> (skipped)

**Study tip:** Review the "What to teach" notes above for each gap before your 1:1 validation session.
```

---

## Notes

- Jira: project `VS`, cloud ID `c546b8b8-c5e9-4677-8322-7a935c3d3860`, base URL `https://jhsdc.atlassian.net/browse/`
- The **1:1 Validation Session** dimension cannot be audited from code — omit it
- If the app has no mutations, mark Server Actions as N/A with an explanation, not a gap
- Always cite specific file paths and line numbers so issues are immediately actionable
- Use `pnpm`, not npm or yarn

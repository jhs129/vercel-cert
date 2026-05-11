# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm storybook    # Start Storybook on port 6006
```

## DevOps Workflow

This project uses an agentic CI/CD pipeline driven by Jira statuses. Human review gates are at Requirements Review and PR review.

```
TO DO → GROOMING → REQUIREMENTS REVIEW → DEV READY → IN PROGRESS → IN REVIEW → DONE
```

**Jira:** `https://jhsdc.atlassian.net` | Project key: `VS`

### Status Definitions

| Status | Owner | Description |
|--------|-------|-------------|
| To Do | Human | Writing initial high-level requirements |
| Grooming | Agent (`/groom`) | Agent refines requirements, posts assumptions/questions as comments, writes AC, transitions to Requirements Review |
| Blocked | Agent | Ticket too vague to groom — agent posts comment explaining what's needed |
| Requirements Review | Human | Review grooming output; approve → Dev Ready, reject → back to Grooming (add comment with feedback) |
| Dev Ready | Agent (`/start-dev`) | Agent creates worktree, implements, builds, creates PR, transitions to In Review |
| In Progress | Agent | Active development happening in a git worktree |
| In Review | Human | PR open on GitHub; review and merge |
| Done | Human | Merged and complete |

### Agent Commands

- **`/groom [ticket-key]`** — Refines one ticket or all Grooming tickets. Non-interactive: posts questions as Jira comments rather than asking interactively. Handles re-grooming by reading prior comment feedback.
- **`/start-dev [ticket-key]`** — Implements one ticket or all Dev Ready tickets in parallel git worktrees. Pulls Vercel dev env vars, implements, creates PR, removes worktree after PR is created.
- **`/fix-jira <ticket-key>`** — Interactive single-ticket refinement + implementation (original manual workflow).
- **`/create-pr`** — Creates a PR for the current branch with Jira integration and version bump.

### Worktree Convention

Each `start-dev` ticket creates a worktree at `../<branch-name>` relative to the repo root. Worktrees are always removed after PR creation. Branch naming: `vs-<number>-<slug>` (e.g. `vs-8-cardimage-component`).

## Architecture

This is a Next.js 16 App Router application. Content is served by an external news API — there is no headless CMS powering page routing. 

### Data Layer

All article content flows through `lib/articles-api.ts`, which fetches from the external news API:

```ts
const API_BASE = process.env.API_BASE ?? "https://vercel-daily-news-api.vercel.app";
```

Key functions and their endpoints:

| Function | Endpoint |
|----------|----------|
| `fetchTrendingArticles()` | `GET /api/articles/trending` |
| `fetchArticleBySlug(slug)` | `GET /api/articles/:slug` |
| `fetchCategories()` | `GET /api/categories` |
| `fetchArticlesByCategory(category?, limit?)` | `GET /api/articles?category=&limit=` |
| `fetchArticlesBySearch(query, category?, limit?)` | `GET /api/articles?search=&category=&limit=` |

All fetches use `next: { revalidate: 60 }` for ISR. The `API_BYPASS_TOKEN` env var is injected as `x-vercel-protection-bypass` when set (for Vercel deployment protection).

Required environment variables:
- `API_BASE` — override the news API base URL (defaults to `https://vercel-daily-news-api.vercel.app`)
- `API_BYPASS_TOKEN` — Vercel deployment protection bypass token (optional)
- `NEXT_PUBLIC_SITE_URL` — canonical base URL; if unset, `og:url` tags are omitted
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager container ID (optional)

### AlertBanner (Partial Builder.io Remnant)

`components/ui/AlertBanner/` still uses Builder.io to fetch CMS-managed alert banners. This is the only remaining Builder.io integration:
- `index.tsx` — async server component. Reads `x-pathname` from headers, calls Builder.io `alert` model, passes `AlertItem[]` to the client. Returns `null` if `NEXT_PUBLIC_BUILDER_API_KEY` is unset.
- `AlertBannerClient.tsx` — `"use client"`. Renders `<Alert>` for each item. No CMS knowledge.

`NEXT_PUBLIC_BUILDER_API_KEY` is required only for this component. The rest of the application functions without it.

### Routing

- `middleware.ts` (exported from `proxy.ts`) — runs on every request and sets an `x-pathname` header so server components can read the current URL path (used by `AlertBanner` for targeting).
- `app/page.tsx` — home page. Fetches trending articles, renders `HeroBanner` + `CardImage` grid.
- `app/browse/page.tsx` — browse all articles by category.
- `app/content/[slug]/page.tsx` — article detail page.
- `app/search/page.tsx` + `SearchPageClient.tsx` — search page (server/client split).
- `app/not-found.tsx` — custom 404.

There is no catch-all route; all content URLs are static Next.js routes backed by the external API.

### Server / Client Split Pattern

Page-level files follow a consistent pattern:
- `app/*/page.tsx` — Server component. Fetches data, calls `notFound()` on misses, passes data down as props.
- `app/*/[Feature]Client.tsx` — Client component (`"use client"`). Owns all interactivity.

Components with sub-components or helpers exceeding ~100 lines are split into a directory: `components/[Name]/index.tsx` (primary component + Props interface) plus co-located files.

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Brand colors are defined as CSS variables in `:root` in `app/globals.css` and mapped to Tailwind tokens via `@theme inline`. Always use these tokens — never hardcode hex values or arbitrary `bg-[#xxx]` classes.

- `--color-background: #ffffff` (page background — white)
- `--color-foreground: #000000`
- `--color-accent: #0070f3`

The footer uses a black background (`bg-black`). Use Tailwind utility classes directly — no CSS modules.

Always use `@apply` with Tailwind classes for all styles in `globals.css`. Never write raw CSS property values (e.g. `font-size: 3.5rem`) — define a named token in `@theme inline` first, then reference it via `@apply`. Custom tokens for typography scale, line heights, letter spacing, etc. live in `@theme inline` so they become named utilities.

### Themeable Interface

Any component that supports theming must implement the `Themeable` interface from `lib/types.ts`:

```ts
// lib/types.ts
export type Theme = "dark" | "light";

export interface Themeable {
  theme?: Theme; // defaults to "light"
}
```

The component is responsible for applying the appropriate CSS class to its root element:

```tsx
// components/ui/MyComponent/index.tsx
"use client";

import type { Themeable } from "@/lib/types";

interface MyComponentProps extends Themeable {
  title: string;
}

export default function MyComponent({ title, theme = "light" }: MyComponentProps) {
  return (
    <div className={`theme-${theme}`}>
      <h2>{title}</h2>
    </div>
  );
}
```

The `theme-dark` and `theme-light` CSS classes are defined in `app/globals.css`. To add a new theme, add the class there and add the value to the `Theme` union in `lib/types.ts`.

### Third-Party Scripts

All third-party scripts must use `next/script` (or `@next/third-parties` wrappers) — never a raw `<script>` HTML tag.

**Strategy selection:**

| Strategy | Use for |
|----------|---------|
| `afterInteractive` | Default — analytics, tracking, payment, authentication scripts |
| `lazyOnload` | Non-essential widgets: chat, social embeds, comment systems |
| `beforeInteractive` | Critical polyfills only (e.g., required before React hydration). Never analytics or marketing. |
| `worker` | Not adopted — experimental, limited browser support. |

**Rules:**
- Any script requiring `onLoad`, `onReady`, or `onError` callbacks must live in a `"use client"` component — not inline in a server layout or page file.
- Prefer `@next/third-parties` wrappers (e.g., `<GoogleTagManager />`) over raw `<Script>` when an official wrapper exists.
- The `noscript` fallback for GTM is intentional — `@next/third-parties` does not include it automatically.
- When using a non-standard strategy, add an inline comment explaining why.

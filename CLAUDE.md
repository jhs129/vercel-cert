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

This is a Next.js 16 App Router application using Builder.io as the primary CMS.

### Builder.io Integration

All CMS content flows through `@builder.io/sdk-react` — the App Router-native SDK. **Do not use `@builder.io/react`** — it is the Page Router SDK and is incompatible with React 19 + Turbopack (causes a `createContext is not a function` crash at module evaluation).

Two Builder.io models are in use:

- **`page`** — drives the catch-all route. Every URL not claimed by a static Next.js route is fetched from this model and rendered via `<Content>`.
- **`alert`** — URL-targeted alert banners fetched on every page and rendered just below the header via the `AlertBanner` component.

Required environment variables:
- `NEXT_PUBLIC_BUILDER_API_KEY` — Builder.io public API key (required; all pages return 404 without it)
- `NEXT_PUBLIC_SITE_URL` — canonical base URL (e.g. `https://example.com`); if unset, canonical URLs and `og:url` tags are omitted from all pages

#### Fetch pattern

Use `fetchOneEntry` (single) or `fetchEntries` (multiple) from `@builder.io/sdk-react`. Always pass a `safeFetch` wrapper to suppress the SDK's internal `console.error` on non-OK responses:

```ts
const safeFetch = async (input: string, init?: object) => {
  const res = await fetch(input, init as RequestInit);
  if (!res.ok) return new Response(JSON.stringify({ results: [] }), { status: 200 });
  return res;
};
```

Pass `getBuilderSearchParams(searchParams)` as `options` and `isPreviewing(searchParams)` to gate `includeUnpublished` — both are exported from `@builder.io/sdk-react`.

#### Rendering

The `<Content>` component from `@builder.io/sdk-react` must be used in a `"use client"` component. Always pass `canTrack={false}` to prevent a React 19 hydration mismatch caused by the SDK's A/B variant initialization script.

### Routing

- `proxy.ts` — runs on every request and sets an `x-pathname` header so server components can read the current URL path (used by `AlertBanner` for targeting).
- `app/[[...page]]/page.tsx` — async server component catch-all. Computes `urlPath`, fetches the Builder.io `page` model, calls `notFound()` when no content and not previewing.
- `app/[[...page]]/BuilderPageClient.tsx` — `"use client"` wrapper that renders `<Content>` and checks `isPreviewing()` client-side for visual editor support.
- `app/not-found.tsx` — custom 404 rendered by `notFound()`.

Static Next.js routes (e.g. `/products/[slug]`) always take precedence over the catch-all.

### Server / Client Split Pattern

Page-level files follow a consistent pattern:
- `app/*/page.tsx` — Server component. Fetches data, calls `notFound()` on misses, passes data down as props.
- `app/*/[Feature]Client.tsx` — Client component (`"use client"`). Owns all interactivity.

Components with sub-components or helpers exceeding ~100 lines are split into a directory: `components/[Name]/index.tsx` (primary component + Props interface) plus co-located files.

### AlertBanner Component

`components/ui/AlertBanner/` is the reference example of the CMS + server/client split:
- `index.tsx` — async server component. Reads `x-pathname` from headers, calls `fetchEntries` for the `alert` model with `userAttributes: { urlPath }`, shapes the data, passes `AlertItem[]` to the client.
- `AlertBannerClient.tsx` — `"use client"`. Renders `<Alert>` for each item. Has no knowledge of Builder.io.

This decoupling means the CMS can be swapped by only touching `index.tsx`.

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Brand colors are defined as CSS variables in `:root` in `app/globals.css` and mapped to Tailwind tokens via `@theme inline`. Always use these tokens — never hardcode hex values or arbitrary `bg-[#xxx]` classes.

- `--color-background: #ffffff` (page background — white)
- `--color-foreground: #000000`
- `--color-accent: #0070f3`

The footer uses a black background (`bg-black`). Use Tailwind utility classes directly — no CSS modules.

Always use `@apply` with Tailwind classes for all styles in `globals.css`. Never write raw CSS property values (e.g. `font-size: 3.5rem`) — define a named token in `@theme inline` first, then reference it via `@apply`. Custom tokens for typography scale, line heights, letter spacing, etc. live in `@theme inline` so they become named utilities.

### Themeable Interface

Any component that supports theming must implement the `Themeable` interface from `lib/types.ts` and use the shared `themeInput` from `lib/builder-inputs.ts` when registering with Builder.io.

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

When registering the component with Builder.io, spread `themeInput` into the `inputs` array:

```ts
// components/ui/MyComponent/MyComponent.builder.ts
import { Builder } from "@builder.io/sdk-react";
import { themeInput } from "@/lib/builder-inputs";
import MyComponent from ".";

Builder.registerComponent(MyComponent, {
  name: "MyComponent",
  inputs: [
    { name: "title", type: "string", defaultValue: "Hello" },
    themeInput,
  ],
});
```

The `theme-dark` and `theme-light` CSS classes are defined in `app/globals.css`. To add a new theme, add the class there and add the value to the `Theme` union in `lib/types.ts`.

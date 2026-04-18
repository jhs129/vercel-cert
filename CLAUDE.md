# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm storybook    # Start Storybook on port 6006
```

## Architecture

This is a Next.js 16 App Router application using Builder.io as the primary CMS.

### Builder.io Integration

All CMS content flows through `@builder.io/sdk-react` — the App Router-native SDK. **Do not use `@builder.io/react`** — it is the Page Router SDK and is incompatible with React 19 + Turbopack (causes a `createContext is not a function` crash at module evaluation).

Two Builder.io models are in use:

- **`page`** — drives the catch-all route. Every URL not claimed by a static Next.js route is fetched from this model and rendered via `<Content>`.
- **`alert`** — URL-targeted alert banners fetched on every page and rendered just below the header via the `AlertBanner` component.

Required environment variable: `NEXT_PUBLIC_BUILDER_API_KEY`.

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

Tailwind CSS v4 via `@tailwindcss/postcss`. Theme variables are in `app/globals.css` under `@theme inline`:
- `--background: #000000`, `--foreground: #ffffff`, `--accent: #0070f3`

Dark-first design: black background, white text, blue/purple gradients for accents. Use Tailwind utility classes directly — no CSS modules.

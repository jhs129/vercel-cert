# GTM Support Design

**Jira:** VS-3  
**Date:** 2026-04-17  
**Status:** Approved

## Goal

Inject Google Tag Manager on every page of the app so marketing/analytics tags can be managed without code deployments.

## Approach

Use `@next/third-parties` — the official Next.js package for third-party integrations. It provides a `<GoogleTagManager>` component that handles the `<Script strategy="afterInteractive">` snippet and `<noscript>` iframe fallback internally.

## Architecture

**Files changed:**
- `package.json` — add `@next/third-parties` dependency
- `app/layout.tsx` — conditionally render `<GoogleTagManager gtmId={id} />` when `NEXT_PUBLIC_GTM_ID` is set
- `.env.local` — document the env var (not committed)

**Data flow:**
1. `NEXT_PUBLIC_GTM_ID` is set in the deployment environment
2. `layout.tsx` reads it via `process.env.NEXT_PUBLIC_GTM_ID`
3. If present, `<GoogleTagManager>` renders inside `<body>` — Next.js injects the `afterInteractive` script and noscript fallback
4. If absent, nothing is rendered — no errors, no warnings

## Constraints

- Env var must be `NEXT_PUBLIC_` prefixed (client-side accessible, embedded at build time)
- No custom dataLayer events required in this ticket
- No SPA page-view tracking required in this ticket

## Acceptance Criteria

- [ ] GTM `<script>` loads via `<Script strategy="afterInteractive">` when `NEXT_PUBLIC_GTM_ID` is set
- [ ] GTM `<noscript>` `<iframe>` fallback present in `<body>` when ID is set
- [ ] No snippets injected and no console errors when ID is not set
- [ ] Container ID sourced from `NEXT_PUBLIC_GTM_ID`
- [ ] `pnpm build` passes with no TypeScript or lint errors
- [ ] Verified manually with a valid `GTM-XXXXXXX` format container ID

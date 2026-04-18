# GTM Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inject Google Tag Manager on every page via `@next/third-parties` when `NEXT_PUBLIC_GTM_ID` is set.

**Architecture:** Install `@next/third-parties`, then update `app/layout.tsx` to conditionally render `<GoogleTagManager gtmId={id} />` inside `<body>`. The component handles both the `afterInteractive` script and `<noscript>` fallback internally.

**Tech Stack:** Next.js 16, `@next/third-parties`, TypeScript, pnpm

---

### Task 1: Install `@next/third-parties`

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto-updated)

- [ ] **Step 1: Install the package**

```bash
pnpm add @next/third-parties
```

Expected output: `@next/third-parties` added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify it installed correctly**

```bash
pnpm list @next/third-parties
```

Expected: version printed with no errors.

---

### Task 2: Update `app/layout.tsx` to conditionally inject GTM

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Open `app/layout.tsx` and replace its contents**

Current file (for reference):
```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "A Next.js shell application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="container mx-auto min-h-full bg-background text-foreground">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

Replace with:
```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { GoogleTagManager } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "A Next.js shell application.",
};

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="container mx-auto min-h-full bg-background text-foreground">
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Run the build to verify no TypeScript or lint errors**

```bash
pnpm build
```

Expected: build completes successfully with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx package.json pnpm-lock.yaml
git commit -m "feat: add GTM support via @next/third-parties (VS-3)"
```

---

### Task 3: Manual verification

- [ ] **Step 1: Add `NEXT_PUBLIC_GTM_ID` to local env and start dev server**

Add to `.env.local` (create if it doesn't exist):
```
NEXT_PUBLIC_GTM_ID=GTM-TEST123
```

Then run:
```bash
pnpm dev
```

- [ ] **Step 2: Verify GTM script is present in page source**

Open `http://localhost:3000` in a browser, view page source, and confirm:
- A `<script>` tag referencing `googletagmanager.com/gtm.js?id=GTM-TEST123` is present
- A `<noscript>` `<iframe>` with `googletagmanager.com/ns.html?id=GTM-TEST123` is present inside `<body>`

- [ ] **Step 3: Verify GTM is absent when env var is unset**

Remove `NEXT_PUBLIC_GTM_ID` from `.env.local` (or comment it out), restart the dev server, and confirm no GTM tags appear in page source and no console errors appear.

- [ ] **Step 4: Run lint to confirm no issues**

```bash
pnpm lint
```

Expected: no errors.

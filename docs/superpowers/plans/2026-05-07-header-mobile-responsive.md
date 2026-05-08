# Header Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hamburger menu to the site header so nav links collapse into a slide-down panel on mobile screens while the desktop layout remains unchanged.

**Architecture:** Keep `header.tsx` as a server component; extract a new `HeaderClient.tsx` client component that owns the `isMenuOpen` toggle state. The server component passes `links` and a pre-rendered `<SubscriptionIndicator />` node as props to `HeaderClient`. Below the `md` breakpoint the desktop nav is hidden and a hamburger button is shown; tapping it reveals a slide-down panel with stacked nav links and the subscription slot.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4, TypeScript, Storybook (nextjs-vite)

---

### Task 1: Create HeaderClient.tsx

**Files:**
- Create: `components/navigation/HeaderClient.tsx`

- [ ] **Step 1: Create the file with the full implementation**

```tsx
// components/navigation/HeaderClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NavLink } from "@/lib/types";

interface HeaderClientProps {
  links: NavLink[];
  subscriptionSlot: React.ReactNode;
}

export function HeaderClient({ links, subscriptionSlot }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="theme-light my-4">
      <div className="flex flex-row items-center gap-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/mark.svg"
            alt="Logo"
            width={262}
            height={52}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="hidden md:flex flex-1 flex-row items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="leading-none">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex">
          {subscriptionSlot}
        </div>
        <button
          className="ml-auto flex md:hidden flex-col gap-1.5 p-1"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? (
            <span className="text-xl leading-none text-foreground" aria-hidden="true">✕</span>
          ) : (
            <>
              <span className="block w-5 h-0.5 bg-foreground rounded" aria-hidden="true" />
              <span className="block w-5 h-0.5 bg-foreground rounded" aria-hidden="true" />
              <span className="block w-5 h-0.5 bg-foreground rounded" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      {isMenuOpen && (
        <nav
          id="mobile-nav"
          className="flex flex-col md:hidden border-t border-border bg-background"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-border py-3 leading-none text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="py-3">
            {subscriptionSlot}
          </div>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/navigation/HeaderClient.tsx
git commit -m "feat: add HeaderClient with mobile hamburger menu"
```

---

### Task 2: Update header.tsx to delegate to HeaderClient

**Files:**
- Modify: `components/navigation/header.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// components/navigation/header.tsx
import type { NavLink } from "@/lib/types";
import { SubscriptionIndicator } from "@/components/ui/SubscriptionIndicator";
import { HeaderClient } from "./HeaderClient";

const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
];

export function Header({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  return (
    <HeaderClient links={links} subscriptionSlot={<SubscriptionIndicator />} />
  );
}
```

- [ ] **Step 2: Run the build to verify no errors**

Run: `pnpm build`
Expected: build completes with no TypeScript or ESLint errors

- [ ] **Step 3: Commit**

```bash
git add components/navigation/header.tsx
git commit -m "feat: wire Header server component to HeaderClient"
```

---

### Task 3: Add Storybook story for HeaderClient

**Files:**
- Create: `components/navigation/Header.stories.tsx`

- [ ] **Step 1: Create the story file**

```tsx
// components/navigation/Header.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeaderClient } from "./HeaderClient";

const meta: Meta<typeof HeaderClient> = {
  title: "Navigation/Header",
  component: HeaderClient,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof HeaderClient>;

const defaultLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
];

function SubscribeButton() {
  return (
    <button className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
      Subscribe
    </button>
  );
}

function SubscribedIndicator() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-accent">Subscribed</span>
      <button className="text-xs text-foreground underline hover:opacity-70 transition-opacity">
        Unsubscribe
      </button>
    </div>
  );
}

export const Default: Story = {
  args: {
    links: defaultLinks,
    subscriptionSlot: <SubscribeButton />,
  },
};

export const Subscribed: Story = {
  args: {
    links: defaultLinks,
    subscriptionSlot: <SubscribedIndicator />,
  },
};

export const CustomLinks: Story = {
  args: {
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    subscriptionSlot: <SubscribeButton />,
  },
};
```

- [ ] **Step 2: Verify Storybook builds without errors**

Run: `pnpm storybook --smoke-test` (if available) or just `pnpm build` to confirm no import errors

- [ ] **Step 3: Commit**

```bash
git add components/navigation/Header.stories.tsx
git commit -m "feat: add Storybook story for Header with mobile/desktop states"
```

---

### Task 4: Manual browser verification

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev`

- [ ] **Step 2: Verify desktop layout (≥ 768px)**

Open `http://localhost:3000` in a browser at full width. Confirm:
- Logo on left, nav links (Home, Browse, Search) in center, Subscribe button on right
- No hamburger icon visible

- [ ] **Step 3: Verify mobile layout (< 768px)**

Open browser devtools and set viewport width to 375px. Confirm:
- Logo on left, hamburger (☰) icon on right
- Nav links and Subscribe button hidden

- [ ] **Step 4: Verify hamburger toggle**

Click the hamburger icon. Confirm:
- Icon changes to ✕
- Slide-down panel appears with Home, Browse, Search links and Subscribe button
- Clicking a nav link closes the panel
- Clicking ✕ closes the panel

- [ ] **Step 5: Verify accessibility**

With devtools open, inspect the hamburger `<button>`. Confirm:
- `aria-expanded="false"` when closed, `"true"` when open
- `aria-controls="mobile-nav"` present
- `aria-label` reads "Open navigation menu" / "Close navigation menu"
- Mobile panel has `id="mobile-nav"`

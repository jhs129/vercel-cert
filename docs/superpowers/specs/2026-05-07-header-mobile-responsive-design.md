# Header Mobile Responsive Redesign

**Date:** 2026-05-07  
**Status:** Approved

## Goal

Make the site header fully mobile-responsive by adding a hamburger menu that reveals a slide-down navigation panel on small screens, while preserving the existing desktop layout unchanged.

## Approved Design

### Desktop (≥ 768px / `md` breakpoint)

Current layout is unchanged:
- Logo on the left (flex-shrink-0)
- Nav links (Home, Browse, Search) in the center (flex-1)
- Subscribe button / Subscribed indicator on the right

### Mobile (< 768px)

- Logo on the left
- Hamburger icon (☰) on the right; nav links and subscribe button hidden
- Tapping hamburger opens a slide-down panel below the header bar:
  - Stacked nav links (full-width rows with a subtle bottom border)
  - Subscribe button (or Subscribed indicator) at the bottom of the panel
- Hamburger icon changes to ✕ when the panel is open
- Tapping ✕ (or any nav link) closes the panel

## Architecture

### Files

| File | Role |
|------|------|
| `components/navigation/header.tsx` | Server component — unchanged entry point. Passes `links` and `<SubscriptionIndicator />` as a React node to `HeaderClient`. |
| `components/navigation/HeaderClient.tsx` | New `"use client"` component. Owns `isMenuOpen` boolean state. Renders desktop nav and mobile hamburger + slide-down panel. |

No changes to `app/layout.tsx` or `SubscriptionIndicator`.

### Component Interface

```tsx
// HeaderClient.tsx
interface HeaderClientProps {
  links: NavLink[];
  subscriptionSlot: React.ReactNode;
}
```

`header.tsx` renders:

```tsx
<HeaderClient links={links} subscriptionSlot={<SubscriptionIndicator />} />
```

### State

`HeaderClient` holds one piece of state:

```ts
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

Nav link clicks set `isMenuOpen` to `false` to close the panel after navigation.

### Breakpoint Strategy

Use Tailwind's `md:` prefix throughout:

- `hidden md:flex` — desktop nav row
- `flex md:hidden` — hamburger button
- Mobile panel: conditionally rendered (`isMenuOpen && <div>…</div>`) — no `max-height` animation needed for v1; simplicity over polish

### Accessibility

- Hamburger `<button>` has `aria-expanded={isMenuOpen}` and `aria-controls="mobile-nav"` 
- `aria-label` toggles between `"Open navigation menu"` and `"Close navigation menu"`
- Mobile panel `<div>` has `id="mobile-nav"`

### Styling Rules

- All styles use Tailwind utility classes — no inline styles, no CSS modules
- Colors use only CSS variable tokens from `globals.css` (e.g. `text-foreground`, `bg-background`, `text-accent`) — no hardcoded hex values
- Panel background: `bg-background` (white); border: `border-border`

## Out of Scope

- Animation/transition on the slide-down panel (can be added later)
- Closing the panel on outside click or `Escape` key (can be added later)
- Sticky/fixed header behavior

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm lint       # Run ESLint
```

## Architecture

This is a Next.js 16 App Router e-commerce store using static data (no database or external API).

### Data Layer (`lib/`)

- **`lib/products.ts`** — Single source of truth for all product data. Defines the `Product` interface and exports utility functions (`getProductBySlug`, `getFeaturedProducts`, `getProductsByCategory`) plus a `categories` array.
- **`lib/cart-context.tsx`** — React Context providing cart state globally. Exposes `useCart()` hook with `addItem`, `removeItem`, `updateQuantity`, `clearCart`. Cart total, item count, and tax are derived values (not stored). The `CartProvider` wraps the root layout.

### Server / Client Split Pattern

Page-level files follow a consistent pattern:
- `app/*/page.tsx` — Server component. Handles `generateMetadata`, `generateStaticParams`, and renders a thin shell that passes data to the client component.
- `app/*/[Feature]Client.tsx` — Client component (`"use client"`). Owns all interactivity (state, router, searchParams, cart).

`Navbar` and `ProductCard` are client components because they consume `useCart()`.

### Routing

- `/products` — filtered by `?category=All|Apparel|Accessories` query param
- `/products/[slug]` — statically generated for all products via `generateStaticParams`
- `/cart` — renders cart from context (client-only state, no persistence)

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Theme variables are defined in `app/globals.css` using `@theme inline`:
- `--background: #000000`, `--foreground: #ffffff`, `--accent: #0070f3`

Use Tailwind utility classes directly; no CSS modules. Follow the dark-first design (black background, white text, blue/purple gradients for accents).

### Product Icons

Products use custom inline SVG icons (defined in `components/ProductCard.tsx`) rather than image files — one icon per product type (Tee, Hoodie, Cap, Sticker, Mug, Socks, Bottle, Notebook). When adding new products, add a corresponding SVG icon.

### Adding a New Product

1. Add entry to the `products` array in `lib/products.ts` following the `Product` interface
2. Add a corresponding SVG icon component in `components/ProductCard.tsx`
3. Add a color gradient mapping for the new product in the `ProductCard` gradient map

### Key Constraints

- No external API or database — all data is static in `lib/products.ts`
- Cart state is in-memory only (React Context); it resets on page refresh
- Checkout is a placeholder — no payment integration exists yet
- Package manager: **pnpm only**

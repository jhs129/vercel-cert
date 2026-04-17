"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <svg
            aria-label="Vercel logo"
            height="22"
            role="img"
            viewBox="0 0 74 64"
            className="text-white fill-current"
          >
            <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
          </svg>
          <span className="text-sm font-semibold text-white tracking-tight">
            Swag Store
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link
            href="/"
            className="transition-colors hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="transition-colors hover:text-white"
          >
            Products
          </Link>
          <Link
            href="/products?category=Apparel"
            className="transition-colors hover:text-white"
          >
            Apparel
          </Link>
          <Link
            href="/products?category=Accessories"
            className="transition-colors hover:text-white"
          >
            Accessories
          </Link>
        </nav>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
        >
          <CartIcon />
          <span>Cart</span>
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M1 1h2l1.5 8h7l1.5-5H4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
}

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NavLink } from "@/lib/types";

interface HeaderClientProps {
  links: NavLink[];
  subscriptionSlot: ReactNode;
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
        <nav aria-label="Primary" className="hidden md:flex flex-1 flex-row items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="leading-none">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center">
          {subscriptionSlot}
        </div>
        <button
          type="button"
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
          aria-label="Mobile"
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

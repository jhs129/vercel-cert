"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEGAL_NAV_LINKS } from "@/lib/legal-nav";

export function LegalNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-4 border-b border-border pb-4 text-sm" aria-label="Legal documents">
      {LEGAL_NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={
            pathname === href
              ? "font-medium text-foreground"
              : "text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";
import { headers } from "next/headers";
import { LEGAL_NAV_LINKS } from "@/lib/legal-nav";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 flex flex-wrap gap-4 border-b border-border pb-4 text-sm" aria-label="Legal documents">
        {LEGAL_NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

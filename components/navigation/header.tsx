import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/lib/types";
import { SubscriptionIndicator } from "@/components/ui/SubscriptionIndicator";

const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" }
];

export function Header({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  return (
    <header className="theme-light flex flex-row items-center gap-8 my-4">
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
      <nav className="flex flex-1 flex-row items-center gap-8">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="leading-none">
            {link.label}
          </Link>
        ))}
      </nav>
      <SubscriptionIndicator />
    </header>
  );
}

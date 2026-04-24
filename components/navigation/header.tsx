import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/lib/types";
import { SubscriptionIndicator } from "@/components/ui/SubscriptionIndicator";

const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
];

export function Header({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  return (
    <header className="theme-light flex flex-row items-center gap-8 mt-8">
      <Link href="/">
        <Image src="/mark.svg" alt="Logo" width={100} height={100} />
      </Link>
      <nav className="flex flex-row justify-between items-center gap-8 flex-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <SubscriptionIndicator />
    </header>
  );
}

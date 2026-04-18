"use client";
 import Image from "next/image";
 import Link from "next/link";

 const DEFAULT_LINKS: { href: string; label: string }[] = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
  ];
  


export function Header({ links = DEFAULT_LINKS }: { links?: { href: string; label: string }[] }) {
  return (
    <header className="flex flex-row gap-8 mt-8">
      <Link href="/">
        <Image src="/mark.svg" alt="Logo" width={100} height={100} />
      </Link>
      <nav className="flex flex-row justify-between items-center gap-8">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
"use client";
 import Image from "next/image";
 import Link from "next/link";

 const DEFAULT_LINKS: { href: string; label: string }[] = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
  ];
  


export function Footer({ links = DEFAULT_LINKS }: { links?: { href: string; label: string }[] }) {
  return (
    <footer className="flex flex-row justify-between items-center">
      <Link href="/">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
      </Link>
      <nav className="flex flex-row justify-between items-center">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
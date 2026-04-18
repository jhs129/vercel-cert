"use client";
import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/lib/types";

const DEFAULT_LINKS: NavLink[] = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

interface FooterProps {
  logo?: string;
  links?: NavLink[];
  copyrightText?: string;
  className?: string;
}

export function Footer({
  logo = "/logo-white.png",
  links = DEFAULT_LINKS,
  copyrightText = "All rights reserved.",
  className = "",
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`theme-dark w-full mt-auto px-5 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <Image src={logo} alt="Logo" width={150} height={100} />
        </Link>

        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="text-sm text-center pb-6">
        &copy; {year} {copyrightText}
      </p>
    </footer>
  );
}

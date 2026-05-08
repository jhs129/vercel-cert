import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Themeable } from "@/lib/types";

export interface HeroBannerProps extends Themeable {
  backgroundImage?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  overlayEnabled?: boolean;
}

export default function HeroBanner({
  backgroundImage,
  headline,
  body,
  ctaLabel,
  ctaHref,
  overlayEnabled = true,
  theme = "light",
}: HeroBannerProps) {
  const hasImageWithOverlay = !!backgroundImage && overlayEnabled;

  return (
    <section
      className={cn(
        "relative flex items-center justify-center min-h-[500px] w-full overflow-hidden",
        theme === "dark" ? "theme-dark" : "theme-light",
        hasImageWithOverlay && "text-white"
      )}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}

      {hasImageWithOverlay && (
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6 md:text-6xl">
          {headline}
        </h1>
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto md:text-xl">
          {body}
        </p>
        <Link
          href={ctaHref}
          className="inline-block rounded-lg bg-accent text-white font-semibold px-8 py-4 text-base transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

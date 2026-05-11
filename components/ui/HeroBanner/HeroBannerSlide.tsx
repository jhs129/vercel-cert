import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroBannerSlideProps {
  backgroundImage?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  overlayEnabled?: boolean;
  active: boolean;
  priority?: boolean;
}

export default function HeroBannerSlide({
  backgroundImage,
  headline,
  body,
  ctaLabel,
  ctaHref,
  overlayEnabled = true,
  active,
  priority = false,
}: HeroBannerSlideProps) {
  const hasImage = !!backgroundImage;
  const hasImageWithOverlay = hasImage && overlayEnabled;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-700",
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!active}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority || undefined}
          loading={priority ? undefined : "lazy"}
        />
      )}

      {hasImageWithOverlay && (
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      )}

      <div
        className={cn(
          "relative z-10 mx-auto max-w-4xl px-6 py-16 text-center",
          hasImage && "text-white",
          hasImage && !overlayEnabled && "rounded-xl bg-black/40 backdrop-blur-sm"
        )}
      >
        <h1 className="text-inherit text-4xl font-bold leading-tight tracking-tight mb-6 md:text-6xl">
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
    </div>
  );
}

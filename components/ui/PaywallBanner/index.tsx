"use client";

import { subscribeCookie } from "@/lib/subscription";
import Image from "next/image";

interface PaywallBannerProps {
  title: string;
  heroImage?: string;
  teaser: string;
  onSubscribe: () => void;
}

export function PaywallBanner({
  title,
  heroImage,
  teaser,
  onSubscribe,
}: PaywallBannerProps) {
  function handleSubscribe() {
    subscribeCookie();
    onSubscribe();
  }

  return (
    <article className="max-w-3xl mx-auto py-8">
      {heroImage && (
        <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-lg">
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            quality={80}
            preload
          />
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-4xl font-bold text-foreground leading-tight">
          {title}
        </h1>
      </header>

      <div className="relative mb-2">
        <p className="text-foreground leading-relaxed">{teaser}</p>
        <div
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 py-10 border-t border-foreground/10">
        <p className="text-lg font-semibold text-foreground">
          Subscribe to read the full article
        </p>
        <p className="text-sm text-muted">Free, instant, no email required</p>
        <button
          onClick={handleSubscribe}
          className="mt-2 bg-accent text-white font-semibold px-10 py-3 rounded-lg hover:opacity-90 transition-opacity"
          aria-label="Subscribe to read the full article"
        >
          Subscribe — it&#39;s free
        </button>
      </div>
    </article>
  );
}

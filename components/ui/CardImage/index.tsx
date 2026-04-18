"use client";

import Image from "next/image";
import type { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";
import type { Themeable, Stylable } from "@/lib/types";

export type HeadingLevel = 2 | 3 | 4;

export interface CardImageProps extends Themeable, Stylable {
  /** URL of the card image */
  src: string;
  /** Alt text for the image (pass empty string "" for decorative images) */
  alt: string;
  /** Card headline text */
  headline: string;
  /** Card body text */
  body: string;
  /** Semantic heading level for the headline (default: 3) */
  headingLevel?: HeadingLevel;
  /** CTA area rendered below body text */
  children?: ReactNode;
}

export default function CardImage({
  src = "https://placehold.co/600x400.png",
  alt,
  headline,
  body,
  headingLevel = 3,
  theme = "light",
  styles,
  children,
}: CardImageProps) {
  const Tag = `h${headingLevel}` as ElementType;

  return (
    <article
      className={cn(
        "flex flex-col h-full w-full max-w-sm overflow-hidden rounded-xl ring-1",
        theme === "dark"
          ? "theme-dark ring-white/10"
          : "theme-light ring-foreground/10",
        styles
      )}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 384px) 100vw, 384px"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-3 p-4">
        {/* Headline */}
        <Tag className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight mb-0">
          {headline}
        </Tag>

        {/* Body text */}
        <p className="line-clamp-3 text-sm leading-relaxed mb-0 opacity-80">
          {body}
        </p>

        {/* CTA zone */}
        {children && (
          <div className="mt-auto pt-2">{children}</div>
        )}
      </div>
    </article>
  );
}

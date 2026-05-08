import type { Themeable } from "@/lib/types";
import HeroBannerClient from "./HeroBannerClient";

export interface Slide {
  backgroundImage?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  overlayEnabled?: boolean;
}

export interface HeroBannerProps extends Themeable {
  slides: Slide[];
  autoPlayInterval?: number;
}

function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function HeroBanner(props: HeroBannerProps) {
  if (!props.slides.length) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: props.slides.map((slide, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: slide.headline,
      description: slide.body,
      url: slide.ctaHref,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // safeJsonLd escapes <, >, & — content is derived from component props, not user input
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schemaData) }}
      />
      <HeroBannerClient {...props} />
    </>
  );
}

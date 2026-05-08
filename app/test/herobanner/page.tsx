import HeroBanner from "@/components/ui/HeroBanner";

export default function HeroBannerTestPage() {
  return (
    <main className="space-y-8">
      {/* Single slide — no controls shown */}
      <HeroBanner
        slides={[
          {
            backgroundImage: "https://placehold.co/1920x1080.png",
            headline: "Single Slide — With Background Image + Overlay",
            body: "Default configuration: background image with dark overlay enabled. Navigation controls are hidden because there is only one slide.",
            ctaLabel: "Get Started",
            ctaHref: "/test/herobanner#single-with-image",
            overlayEnabled: true,
          },
        ]}
        theme="light"
        autoPlayInterval={0}
      />

      {/* Multi-slide carousel with auto-play */}
      <HeroBanner
        slides={[
          {
            backgroundImage: "https://placehold.co/1920x1080.png",
            headline: "Multi-Slide Carousel — Slide One",
            body: "This carousel auto-advances every 4 seconds. Hover over it to pause, or use the arrow buttons and dot indicators to navigate manually.",
            ctaLabel: "Learn More",
            ctaHref: "/test/herobanner#multi-slide-1",
            overlayEnabled: true,
          },
          {
            backgroundImage: "https://placehold.co/1920x1080/0070f3/ffffff.png",
            headline: "Multi-Slide Carousel — Slide Two",
            body: "Second slide with a blue placeholder image and overlay disabled. Note the arrow and dot controls are visible.",
            ctaLabel: "Explore Features",
            ctaHref: "/test/herobanner#multi-slide-2",
            overlayEnabled: false,
          },
          {
            headline: "Multi-Slide Carousel — Slide Three (No Image)",
            body: "Third slide with no background image — falls back to the theme background color. Carousel wraps back to slide one after this.",
            ctaLabel: "See Pricing",
            ctaHref: "/test/herobanner#multi-slide-3",
          },
        ]}
        theme="light"
        autoPlayInterval={4000}
      />

      {/* Single slide — dark theme, no image */}
      <HeroBanner
        slides={[
          {
            headline: "Dark Theme — No Background Image",
            body: "Dark theme variant without a background image. Applies theme-dark CSS class: dark background with light foreground text.",
            ctaLabel: "Explore Features",
            ctaHref: "/test/herobanner#dark-no-image",
          },
        ]}
        theme="dark"
        autoPlayInterval={0}
      />

      {/* Multi-slide — dark theme */}
      <HeroBanner
        slides={[
          {
            backgroundImage: "https://placehold.co/1920x1080/111111/ffffff.png",
            headline: "Dark Theme Multi-Slide — Slide One",
            body: "Dark theme applied at carousel level across all slides. Theme class controls background and text color in the absence of an image.",
            ctaLabel: "View Details",
            ctaHref: "/test/herobanner#dark-multi-1",
            overlayEnabled: true,
          },
          {
            headline: "Dark Theme Multi-Slide — Slide Two",
            body: "No background image on this slide. The carousel-level dark theme ensures consistent styling across mixed slide configurations.",
            ctaLabel: "Read More",
            ctaHref: "/test/herobanner#dark-multi-2",
          },
        ]}
        theme="dark"
        autoPlayInterval={5000}
      />

      {/* Long content overflow check */}
      <HeroBanner
        slides={[
          {
            backgroundImage: "https://placehold.co/1920x1080.png",
            headline: "Very Long Headline That Tests Layout Integrity With Extended Content Spanning Multiple Lines Across All Viewports",
            body: "This intentionally long body paragraph verifies that the hero layout handles extended content gracefully. The text should wrap naturally, maintain proper line height, and the call-to-action button should remain visible and accessible below the body copy regardless of how much text is present above it.",
            ctaLabel: "Read the Full Story",
            ctaHref: "/test/herobanner#long-content",
            overlayEnabled: true,
          },
        ]}
        theme="light"
        autoPlayInterval={0}
      />
    </main>
  );
}

import HeroBanner from "@/components/ui/HeroBanner";

export default function HeroBannerTestPage() {
  return (
    <main className="space-y-8">
      <HeroBanner
        backgroundImage="https://placehold.co/1920x1080.png"
        headline="With Background Image + Overlay (Light Theme)"
        body="Default configuration: background image with dark overlay enabled. Text is forced white for contrast. This is the most common usage."
        ctaLabel="Get Started"
        ctaHref="/test/herobanner#variant-1"
        overlayEnabled={true}
        theme="light"
      />

      <HeroBanner
        backgroundImage="https://placehold.co/1920x1080.png"
        headline="With Background Image — Overlay Disabled"
        body="Overlay is disabled. Text uses the theme color, which may have lower contrast against some images. Best used with intentionally light or minimal background images."
        ctaLabel="Learn More"
        ctaHref="/test/herobanner#variant-2"
        overlayEnabled={false}
        theme="light"
      />

      <HeroBanner
        headline="No Background Image — Light Theme Fallback"
        body="When backgroundImage is omitted or undefined, the component renders with the theme's background color. No broken layout or console errors."
        ctaLabel="Browse Articles"
        ctaHref="/test/herobanner#variant-3"
        overlayEnabled={true}
        theme="light"
      />

      <HeroBanner
        headline="No Background Image — Dark Theme Fallback"
        body="Dark theme variant without a background image. Applies theme-dark CSS class: dark background with light text."
        ctaLabel="Explore Features"
        ctaHref="/test/herobanner#variant-4"
        overlayEnabled={true}
        theme="dark"
      />

      <HeroBanner
        backgroundImage="https://placehold.co/1920x1080.png"
        headline="This Is a Very Long Headline That Tests Layout Integrity With Extended Content Spanning Multiple Lines"
        body="This intentionally long body text verifies that the layout does not overflow or obscure the CTA button below. The hero should expand vertically to accommodate all content while maintaining its min-height and the CTA must always remain visible and clickable."
        ctaLabel="Read the Full Story"
        ctaHref="/test/herobanner#variant-5"
        overlayEnabled={true}
        theme="light"
      />
    </main>
  );
}

import CardImage from "@/components/ui/CardImage";

export default function CardImageTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1>CardImage Component Test</h1>

      {/* Single card — all props filled */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Single Card (All Props)</h2>
        <div className="flex">
          <CardImage
            src="https://placehold.co/600x338.png"
            alt="A sample image for the CardImage component test"
            headline="Introducing the Next Generation Platform"
            body="Our platform brings together cutting-edge technology and intuitive design to help teams ship faster, collaborate better, and build products their customers love."
            headingLevel={3}
            theme="light"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Learn More
            </a>
          </CardImage>
        </div>
      </section>

      {/* Row of 3 cards — equal height + CTA alignment */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Multi-Card Row (Equal Height + CTA at Bottom)</h2>
        <div className="flex flex-row gap-6 items-stretch">
          <CardImage
            src="https://placehold.co/600x338.png"
            alt="First card image showing short content"
            headline="Short Card"
            body="Minimal body text."
            theme="light"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Get Started
            </a>
          </CardImage>

          <CardImage
            src="https://placehold.co/600x338.png"
            alt="Second card image showing medium content"
            headline="Medium Length Headline That Wraps to Two Lines"
            body="This card has more body text than the first, which means the total content height is taller. Despite this, all cards in the row stretch to equal height and the CTA button aligns to the bottom of each card consistently."
            theme="light"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Read More
            </a>
          </CardImage>

          <CardImage
            src="https://placehold.co/600x338.png"
            alt="Third card image showing brief content"
            headline="Another Card"
            body="Another short body."
            theme="light"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Explore
            </a>
          </CardImage>
        </div>
      </section>

      {/* Dark theme variant */}
      <section className="bg-foreground p-8 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4 text-background">Dark Theme Variant</h2>
        <div className="flex flex-row gap-6 items-stretch">
          <CardImage
            src="https://placehold.co/600x338.png"
            alt="Dark theme card image"
            headline="Dark Theme Card"
            body="This card uses the dark theme, providing WCAG AA compliant contrast on dark backgrounds. The text and background colors automatically adapt."
            theme="dark"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-background text-foreground text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Learn More
            </a>
          </CardImage>

          <CardImage
            src="https://placehold.co/600x338.png"
            alt="Dark theme secondary card image"
            headline="Another Dark Card"
            body="Side by side dark themed cards in a row still achieve equal height and CTA alignment."
            theme="dark"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-background text-foreground text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Discover
            </a>
          </CardImage>
        </div>
      </section>

      {/* Line clamp demonstration */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Line Clamp Demonstration</h2>
        <div className="flex">
          <CardImage
            src="https://placehold.co/600x338.png"
            alt="Card demonstrating text truncation with line clamping"
            headline="This Headline Is Intentionally Very Long to Demonstrate That It Will Be Clamped to Two Lines Maximum"
            body="This body text is also intentionally very long to demonstrate the three-line clamp behavior. The text should be truncated with an ellipsis after three lines regardless of how much content is provided. This helps maintain consistent card heights across cards with varying content lengths."
            theme="light"
          >
            <a
              href="#"
              className="inline-block rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
            >
              Read Full Article
            </a>
          </CardImage>
        </div>
      </section>
    </main>
  );
}

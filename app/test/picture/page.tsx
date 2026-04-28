import Picture from "@/components/ui/Picture";

export default function PictureTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Picture — Test Page</h1>

      {/* Default: no sources, single image */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Default (no art direction)</h2>
        <Picture
          defaultSrc="https://placehold.co/800x450.png"
          defaultWidth={800}
          defaultHeight={450}
          alt="Default placeholder image"
          className="w-full max-w-2xl rounded-lg overflow-hidden"
        />
      </section>

      {/* Art direction: different crops per breakpoint */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Art direction (landscape → square at mobile)</h2>
        <Picture
          defaultSrc="https://placehold.co/400x400.png"
          defaultWidth={400}
          defaultHeight={400}
          alt="Art direction placeholder"
          sources={[
            {
              src: "https://placehold.co/1280x720.png",
              width: 1280,
              height: 720,
              media: "(min-width: 1024px)",
            },
            {
              src: "https://placehold.co/768x432.png",
              width: 768,
              height: 432,
              media: "(min-width: 640px)",
            },
          ]}
          className="w-full max-w-2xl rounded-lg overflow-hidden"
        />
      </section>

      {/* With priority flag */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Priority (LCP candidate)</h2>
        <Picture
          defaultSrc="https://placehold.co/1200x675.png"
          defaultWidth={1200}
          defaultHeight={675}
          alt="Priority placeholder image"
          priority
          quality={90}
          className="w-full max-w-4xl rounded-lg overflow-hidden"
        />
      </section>
    </main>
  );
}

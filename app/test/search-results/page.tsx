import SearchResults from "@/components/ui/SearchResults";

const sampleArticles = [
  {
    id: "1",
    name: "Article 1",
    published: "published",
    data: {
      slug: "intro-to-nextjs",
      title: "Introduction to Next.js App Router",
      publishDate: Date.now() - 86400000,
      metadata: { media: "https://placehold.co/600x338.png" },
    },
  },
  {
    id: "2",
    name: "Article 2",
    published: "published",
    data: {
      slug: "tailwind-tips",
      title: "Tailwind CSS Tips and Tricks for Modern UI",
      publishDate: Date.now() - 2 * 86400000,
      metadata: {},
    },
  },
  {
    id: "3",
    name: "Article 3",
    published: "published",
    data: {
      slug: "builder-io-guide",
      title: "Getting Started with Builder.io",
      publishDate: Date.now() - 3 * 86400000,
      metadata: { media: "https://placehold.co/600x338.png" },
    },
  },
];

export default function SearchResultsTestPage() {
  return (
    <main className="p-8 space-y-12">
      <h1 className="text-2xl font-bold">SearchResults — Test Page</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">3 results with mixed image/no-image</h2>
        <SearchResults articles={sampleArticles} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Empty (renders nothing)</h2>
        <div className="border border-dashed border-border rounded p-4 text-muted text-sm">
          [SearchResults with empty array renders nothing here]
        </div>
        <SearchResults articles={[]} />
      </section>
    </main>
  );
}

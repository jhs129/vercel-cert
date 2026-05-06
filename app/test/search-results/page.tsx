import SearchResults from "@/components/ui/SearchResults";
import type { Article } from "@/lib/articles-api";

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Introduction to Next.js App Router",
    slug: "intro-to-nextjs",
    excerpt: "A deep dive into the Next.js App Router and how it changes the way we build React apps.",
    image: "https://placehold.co/600x338.png",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    category: "engineering",
  },
  {
    id: "2",
    title: "Tailwind CSS Tips and Tricks for Modern UI",
    slug: "tailwind-tips",
    excerpt: "Practical tips to get the most out of Tailwind CSS in your design system.",
    image: "",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: "design",
  },
  {
    id: "3",
    title: "Getting Started with Builder.io",
    slug: "builder-io-guide",
    excerpt: "How to connect Builder.io to your Next.js application with the App Router SDK.",
    image: "https://placehold.co/600x338.png",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: "changelog",
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

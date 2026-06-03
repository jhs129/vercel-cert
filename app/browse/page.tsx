import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { fetchArticlesByCategory, fetchCategories } from "@/lib/articles-api";
import BrowseShell from "@/components/ui/CategoryBrowse/BrowseShell";

export const metadata: Metadata = {
  title: "Browse Articles",
  description: "Browse and filter articles by category.",
  openGraph: {
    title: "Browse Articles",
    description: "Browse and filter articles by category.",
    siteName: "Vercel News Site",
    url: "/browse",
    images: [{ url: "/og-image.png" }],
  },
};

async function CachedBrowseContent({ category }: { category?: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "categories");

  const [articles, categoryList] = await Promise.all([
    fetchArticlesByCategory(category, 100),
    fetchCategories(),
  ]);

  const categories = [
    ...new Set(
      categoryList.length > 0
        ? categoryList.map((c) => c.slug)
        : articles.flatMap((a) => (a.category ? [a.category] : []))
    ),
  ];

  return (
    <BrowseShell
      key={category ?? "all"}
      title="Browse our Articles"
      articles={articles}
      categories={categories}
      activeCategory={category ?? null}
    />
  );
}

async function BrowseContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <CachedBrowseContent category={category} />;
}

function BrowseSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading browse"
      className="animate-pulse rounded-lg border border-border p-6"
    >
      <div className="h-10 w-48 rounded bg-muted/30 mb-6" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded bg-muted/20" />
        ))}
      </div>
    </div>
  );
}

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <div className="py-8">
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

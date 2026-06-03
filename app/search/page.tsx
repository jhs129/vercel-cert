import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchTrendingArticles, fetchCategories } from "@/lib/articles-api";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search Articles",
  description: "Search our article library",
  openGraph: {
    title: "Search Articles",
    description: "Search our article library",
    siteName: "Vercel News Site",
    url: "/search",
    images: [{ url: "/og-image.png" }],
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; delay?: string }>;
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";
  const initialCategory = params.category ?? null;
  const simulateDelay = params.delay === "true";

  const [defaultArticles, categoryList] = await Promise.all([
    fetchTrendingArticles(),
    fetchCategories(),
  ]);
  const categories = categoryList.map((c) => c.slug);

  return (
    <SearchPageClient
      initialQuery={initialQuery}
      initialCategory={initialCategory}
      defaultArticles={defaultArticles}
      categories={categories}
      simulateDelay={simulateDelay}
    />
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense>
      <SearchPageContent {...props} />
    </Suspense>
  );
}

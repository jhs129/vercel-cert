import type { Metadata } from "next";
import { fetchTrendingArticles } from "@/lib/articles-api";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search Articles",
  description: "Search our article library",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; delay?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";
  const initialCategory = params.category ?? null;
  const simulateDelay = params.delay === "true";

  const defaultArticles = await fetchTrendingArticles();
  const categories = [...new Set(defaultArticles.flatMap((a) => (a.category ? [a.category] : [])))];

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

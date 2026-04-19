import type { Metadata } from "next";
import { fetchArticles, fetchArticleCategories } from "@/lib/builder";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search Articles",
  description: "Search our article library",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";
  const initialCategory = params.category ?? null;

  const [defaultArticles, categories] = await Promise.all([
    fetchArticles(5),
    fetchArticleCategories(),
  ]);

  return (
    <SearchPageClient
      initialQuery={initialQuery}
      initialCategory={initialCategory}
      defaultArticles={defaultArticles}
      categories={categories}
    />
  );
}

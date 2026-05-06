"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Article, Category } from "@/lib/articles-api";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { ArticleHit } from "@/components/ui/ArticleHit";
import SearchEmptyState from "@/components/ui/SearchEmptyState";
import type { Themeable } from "@/lib/types";
import { sanitizeHtml } from "@/lib/sanitize-html";

const PAGE_SIZE = 10;

interface CategoryBrowseClientProps extends Themeable {
  title?: string;
}

export default function CategoryBrowseClient({
  title = "Browse Articles",
  theme = "light",
}: CategoryBrowseClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategory = searchParams.get("category");

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(({ categories }: { categories: Category[] }) => {
        setCategories(categories.map((c) => c.slug));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (activeCategory) params.set("category", activeCategory);

    fetch(`/api/articles-by-category?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(({ articles }: { articles: Article[] }) => {
        setArticles(articles);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [activeCategory]);

  const handleCategoryChange = (cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const paged = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={`theme-${theme} flex flex-col gap-6 p-6`}>
      {title && <h2 dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }} />}

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {isLoading ? (
        <div role="status" aria-label="Loading articles" className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 border-b border-border pb-4 animate-pulse">
              <div className="h-5 w-3/4 rounded bg-muted/30" />
              <div className="h-3 w-1/4 rounded bg-muted/30" />
              <div className="h-3 w-full rounded bg-muted/30" />
              <div className="h-3 w-5/6 rounded bg-muted/30" />
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <SearchEmptyState
          query={activeCategory ?? ""}
          onClearSearch={() => handleCategoryChange(null)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {paged.map((article) => (
            <ArticleHit
              key={article.id}
              title={article.title}
              slug={article.slug}
              publishDate={
                article.publishedAt
                  ? new Date(article.publishedAt).getTime()
                  : undefined
              }
              description={article.excerpt}
              categories={article.category ? [article.category] : undefined}
            />
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-40 hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-40 hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

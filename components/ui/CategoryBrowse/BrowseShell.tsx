"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Article } from "@/lib/articles-api";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { ArticleHit } from "@/components/ui/ArticleHit";
import SearchEmptyState from "@/components/ui/SearchEmptyState";
import type { Themeable } from "@/lib/types";

const PAGE_SIZE = 10;

interface BrowseShellProps extends Themeable {
  title?: string;
  articles: Article[];
  categories: string[];
  activeCategory: string | null;
}

export default function BrowseShell({
  title = "Browse Articles",
  theme = "light",
  articles,
  categories,
  activeCategory,
}: BrowseShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const paged = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={`theme-${theme} flex flex-col gap-6 p-6`}>
      {title && <h2>{title}</h2>}

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      <div className={isPending ? "opacity-50 pointer-events-none transition-opacity duration-150" : "transition-opacity duration-150"}>
        {paged.length === 0 ? (
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
      </div>

      {totalPages > 1 && (
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

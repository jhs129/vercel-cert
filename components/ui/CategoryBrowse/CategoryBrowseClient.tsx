"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { CmsArticle } from "@/lib/cms-models";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { ArticleHit } from "@/components/ui/ArticleHit";
import SearchEmptyState from "@/components/ui/SearchEmptyState";
import SearchLoadingState from "@/components/ui/SearchLoadingState";
import type { Themeable } from "@/lib/types";

const PAGE_SIZE = 10;
const MAX_ARTICLES = 100;

interface CategoryItem {
  label: string;
  value: string;
}

interface CategoryBrowseClientProps extends Themeable {
  title?: string;
  categories?: CategoryItem[];
}

export default function CategoryBrowseClient({
  title = "Browse Articles",
  theme = "light",
  categories: categoriesProp,
}: CategoryBrowseClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategory = searchParams.get("category");

  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const configuredCategories = Array.isArray(categoriesProp)
      ? categoriesProp.filter((c) => c.value !== "all").map((c) => c.value)
      : [];

    fetch(`/api/articles?limit=${MAX_ARTICLES}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(({ articles, categories }: { articles: CmsArticle[]; categories: string[] }) => {
        setArticles(articles);
        setCategories(configuredCategories.length > 0 ? configuredCategories : categories);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []); // categoriesProp is a CMS-set prop, stable at mount

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

  const filtered = activeCategory
    ? articles.filter((a) => a.data.categories?.includes(activeCategory))
    : articles;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={`theme-${theme} flex flex-col gap-6 p-6`}>
      {title && <h2>{title}</h2>}
      <SearchLoadingState isLoading={isLoading} />
      {!isLoading && (
        <>
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
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
                  title={article.data.title ?? ""}
                  slug={article.data.slug ?? ""}
                  publishDate={article.data.publishDate}
                  description={article.data.metadata?.description}
                  categories={article.data.categories}
                />
              ))}
            </div>
          )}
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
        </>
      )}
    </div>
  );
}

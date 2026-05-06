"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/articles-api";
import SearchInput from "@/components/ui/SearchInput";
import CategoryFilter from "@/components/ui/CategoryFilter";
import SearchResults from "@/components/ui/SearchResults";
import SearchEmptyState from "@/components/ui/SearchEmptyState";
import SearchLoadingState from "@/components/ui/SearchLoadingState";

const DEBOUNCE_MS = 300;
const MIN_AUTO_SEARCH_LENGTH = 3;

const DELAY_MS = 5000;

interface SearchPageClientProps {
  initialQuery: string;
  initialCategory: string | null;
  defaultArticles: Article[];
  categories: string[];
  simulateDelay?: boolean;
}

export default function SearchPageClient({
  initialQuery,
  initialCategory,
  defaultArticles,
  categories,
  simulateDelay = false,
}: SearchPageClientProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [results, setResults] = useState<Article[]>(
    initialQuery ? [] : defaultArticles
  );
  const [isLoading, setIsLoading] = useState(!!initialQuery || simulateDelay);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const syncUrl = useCallback(
    (q: string, category: string | null) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  const executeSearch = useCallback(async (query: string, category: string | null) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setActiveQuery(query);
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category ?? "")}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error("search failed");
      const { articles: data }: { articles: Article[] } = await res.json();
      if (!controller.signal.aborted) setResults(data);
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") setResults([]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  // Fire initial search if a query was provided via URL
  useEffect(() => {
    if (!initialQuery) return;
    const controller = new AbortController();
    abortRef.current = controller;
    (async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(initialQuery)}&category=${encodeURIComponent(initialCategory ?? "")}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("search failed");
        const { articles: data }: { articles: Article[] } = await res.json();
        if (!controller.signal.aborted) setResults(data);
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate loading state for testing purposes when ?delay=true
  useEffect(() => {
    if (!simulateDelay) return;
    const timer = setTimeout(() => setIsLoading(false), DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-search when input reaches MIN_AUTO_SEARCH_LENGTH+
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = inputValue.trim();
    if (trimmed.length >= MIN_AUTO_SEARCH_LENGTH) {
      debounceRef.current = setTimeout(() => {
        syncUrl(trimmed, activeCategory);
        executeSearch(trimmed, activeCategory);
      }, DEBOUNCE_MS);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleSearch = (query: string) => {
    if (!query) return handleClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl(query, activeCategory);
    executeSearch(query, activeCategory);
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    syncUrl(inputValue.trim(), category);
    const trimmed = inputValue.trim();
    if (trimmed) {
      executeSearch(trimmed, category);
    } else {
      setResults(
        category
          ? defaultArticles.filter((a) => a.category === category)
          : defaultArticles
      );
    }
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setInputValue("");
    setActiveQuery("");
    setIsLoading(false);
    syncUrl("", activeCategory);
    setResults(
      activeCategory
        ? defaultArticles.filter((a) => a.category === activeCategory)
        : defaultArticles
    );
  };

  const isDefaultView = !activeQuery && !isLoading;

  return (
    <div className="py-12 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Search Articles</h1>

      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        onSearch={handleSearch}
      />

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      <section aria-label={activeQuery ? "Search results" : "Recent articles"}>
        <SearchLoadingState isLoading={isLoading} />

        {!isLoading && results.length > 0 && (
          <>
            {isDefaultView && (
              <h2 className="text-lg font-semibold mb-4 text-muted">Trending Articles</h2>
            )}
            <SearchResults articles={results} />
          </>
        )}

        {!isLoading && results.length === 0 && (
          <SearchEmptyState query={activeQuery} onClearSearch={handleClear} />
        )}
      </section>
    </div>
  );
}

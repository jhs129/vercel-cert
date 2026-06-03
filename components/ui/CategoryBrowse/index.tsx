import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { fetchArticlesByCategory, fetchCategories } from "@/lib/articles-api";
import BrowseShell from "./BrowseShell";
import type { Themeable } from "@/lib/types";

interface CategoryBrowseProps extends Themeable {
  title?: string;
  activeCategory?: string;
}

export default async function CategoryBrowse({
  title,
  theme,
  activeCategory,
}: CategoryBrowseProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", "categories");

  const [articles, categoryList] = await Promise.all([
    fetchArticlesByCategory(activeCategory, 100),
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
    <Suspense>
      <BrowseShell
        title={title}
        theme={theme}
        articles={articles}
        categories={categories}
        activeCategory={activeCategory ?? null}
      />
    </Suspense>
  );
}

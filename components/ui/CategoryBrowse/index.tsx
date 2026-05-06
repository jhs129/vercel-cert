import { Suspense } from "react";
import CategoryBrowseClient from "./CategoryBrowseClient";
import { fetchCategories } from "@/lib/articles-api";
import type { Themeable } from "@/lib/types";

interface CategoryBrowseProps extends Themeable {
  title?: string;
}

export default async function CategoryBrowse(props: CategoryBrowseProps) {
  const categories = await fetchCategories();
  const categorySlugs = categories.map((c) => c.slug);

  return (
    <Suspense>
      <CategoryBrowseClient {...props} categories={categorySlugs} />
    </Suspense>
  );
}

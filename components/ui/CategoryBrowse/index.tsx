import { Suspense } from "react";
import CategoryBrowseClient from "./CategoryBrowseClient";
import type { Themeable } from "@/lib/types";

interface CategoryBrowseProps extends Themeable {
  title?: string;
}

export default function CategoryBrowse(props: CategoryBrowseProps) {
  return (
    <Suspense>
      <CategoryBrowseClient {...props} />
    </Suspense>
  );
}

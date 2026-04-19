"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const all = [null, ...categories];

  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
      {all.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <button
            key={cat ?? "__all__"}
            type="button"
            onClick={() => onCategoryChange(cat)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full border px-4 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              isActive
                ? "border-accent bg-accent text-white"
                : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
            )}
          >
            {cat ?? "All"}
          </button>
        );
      })}
    </div>
  );
}

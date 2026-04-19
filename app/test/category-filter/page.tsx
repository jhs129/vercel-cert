"use client";

import { useState } from "react";
import CategoryFilter from "@/components/ui/CategoryFilter";

const SAMPLE_CATEGORIES = ["Technology", "Business", "Design", "Engineering", "Product"];

export default function CategoryFilterTestPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="p-8 space-y-12">
      <h1 className="text-2xl font-bold">CategoryFilter — Test Page</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Active: <code className="text-accent">{active ?? "All"}</code>
        </h2>
        <CategoryFilter
          categories={SAMPLE_CATEGORIES}
          activeCategory={active}
          onCategoryChange={setActive}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">No categories (only All chip)</h2>
        <CategoryFilter
          categories={[]}
          activeCategory={null}
          onCategoryChange={() => {}}
        />
      </section>
    </main>
  );
}

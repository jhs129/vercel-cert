"use client";

import SearchEmptyState from "@/components/ui/SearchEmptyState";

export default function SearchEmptyStateTestPage() {
  return (
    <main className="p-8 space-y-12">
      <h1 className="text-2xl font-bold">SearchEmptyState — Test Page</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">Active search with no results</h2>
        <SearchEmptyState query="next.js routing" onClearSearch={() => alert("clear")} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">No query / no articles</h2>
        <SearchEmptyState query="" onClearSearch={() => alert("clear")} />
      </section>
    </main>
  );
}

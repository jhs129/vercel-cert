import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryBrowseClient from "@/components/ui/CategoryBrowse/CategoryBrowseClient";

export const metadata: Metadata = {
  title: "Browse Articles",
  description: "Browse and filter articles by category.",
};

export default function BrowsePage() {
  return (
    <div className="py-8">
      <Suspense
        fallback={
          <div
            role="status"
            aria-label="Loading browse"
            className="animate-pulse rounded-lg border border-border p-6"
          >
            <div className="h-10 w-48 rounded bg-muted/30 mb-6" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded bg-muted/20" />
              ))}
            </div>
          </div>
        }
      >
        <CategoryBrowseClient title="Browse our Articles" theme="light" />
      </Suspense>
    </div>
  );
}

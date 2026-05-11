import { AlertBannerClient } from "@/components/ui/AlertBanner/AlertBannerClient";

export default function AlertBannerTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">AlertBanner — Test Page</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Urgent (breaking) variant</h2>
        <AlertBannerClient
          item={{
            id: "test-1",
            headline: "This is a breaking news headline.",
            summary: "Summary of the breaking news.",
            articleId: "article-1",
            category: "company-news",
            publishedAt: "2025-07-10T09:00:00Z",
            urgent: true,
          }}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Non-urgent (info) variant</h2>
        <AlertBannerClient
          item={{
            id: "test-2",
            headline: "Something informational to share with you.",
            summary: "More detail about this item.",
            articleId: "article-2",
            category: "product-updates",
            publishedAt: "2025-07-10T09:00:00Z",
            urgent: false,
          }}
        />
      </section>
    </main>
  );
}

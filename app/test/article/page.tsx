import { ArticleClient } from "@/app/content/[slug]/ArticleClient";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";

export default function ArticleTestPage() {
  return (
    <main className="p-8 space-y-16">
      <h1 className="text-2xl font-bold">Article Layout — Test Page</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted">With hero image + date</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <ArticleClient
            content={null}
            apiKey={BUILDER_API_KEY}
            title="Breaking: Next.js 16 Ships with Turbopack by Default"
            publishDate={1745712000000}
            heroImage="https://placehold.co/1200x630.png"
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted">No hero image, with date</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <ArticleClient
            content={null}
            apiKey={BUILDER_API_KEY}
            title="Edge Case: Article Without a Hero Image"
            publishDate={1745712000000}
            heroImage={undefined}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted">No hero image, no date (publishDate=0)</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <ArticleClient
            content={null}
            apiKey={BUILDER_API_KEY}
            title="Edge Case: No Date or Hero"
            publishDate={0}
            heroImage={undefined}
          />
        </div>
      </section>
    </main>
  );
}

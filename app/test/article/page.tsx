import { ArticleClient } from "@/app/content/[slug]/ArticleClient";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

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
            formattedDate={formatDate(1745712000000)}
            heroImage="https://placehold.co/1200x630.png"
            heroImageBlur={undefined}
            teaser="Modern web infrastructure is undergoing a fundamental shift."
            initialSubscribed={true}
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
            formattedDate={formatDate(1745712000000)}
            heroImage={undefined}
            heroImageBlur={undefined}
            teaser="An article without a hero image still renders correctly."
            initialSubscribed={true}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted">No hero image, no date</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <ArticleClient
            content={null}
            apiKey={BUILDER_API_KEY}
            title="Edge Case: No Date or Hero"
            formattedDate={null}
            heroImage={undefined}
            heroImageBlur={undefined}
            teaser="An article with no date or hero image."
            initialSubscribed={true}
          />
        </div>
      </section>
    </main>
  );
}

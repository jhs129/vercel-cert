import { ArticleHit } from "@/components/ui/ArticleHit";

export default function ArticleHitTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">ArticleHit — Test Page</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500">Default</h2>
        <ArticleHit title="Getting Started with Next.js" slug="getting-started-with-nextjs" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500">Long Title</h2>
        <ArticleHit
          title="This Is a Much Longer Article Title That Might Wrap to Multiple Lines in Narrow Containers"
          slug="long-title-article"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500">Multiple Results</h2>
        <div className="flex flex-col gap-3">
          <ArticleHit title="Introduction to TypeScript" slug="intro-to-typescript" />
          <ArticleHit title="React Server Components Explained" slug="react-server-components" />
          <ArticleHit title="Tailwind CSS Best Practices" slug="tailwind-css-best-practices" />
        </div>
      </section>
    </main>
  );
}

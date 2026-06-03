import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { cacheProfiles } from "@/lib/cache-profiles";
import HeroBanner from "@/components/ui/HeroBanner";
import CardImage from "@/components/ui/CardImage";
import { generateBlurPlaceholder } from "@/lib/image-utils";
import { fetchTrendingArticles } from "@/lib/articles-api";

export const metadata: Metadata = {
  title: "Home",
  description: "The latest news and trending articles.",
  openGraph: {
    title: "Home",
    description: "The latest news and trending articles.",
    siteName: "Vercel News Site",
    url: "/",
    images: [{ url: "/og-image.png" }],
  },
};

async function CachedHomeContent() {
  "use cache";
  cacheLife(cacheProfiles.short);
  cacheTag("trending");

  const articles = await fetchTrendingArticles();

  const articlesWithBlur = await Promise.all(
    articles.slice(0, 4).map(async (article) => ({
      ...article,
      blurDataURL: article.image ? await generateBlurPlaceholder(article.image) : undefined,
    }))
  );

  const [hero, ...cards] = articlesWithBlur;

  return (
    <>
      {hero && (
        <HeroBanner
          slides={[
            {
              backgroundImage: hero.image,
              headline: hero.title,
              body: hero.excerpt,
              ctaLabel: "Read More",
              ctaHref: `/content/${hero.slug}`,
            },
          ]}
        />
      )}
      {cards.length > 0 && (
        <section className="py-8">
          <h2 className="text-3xl font-bold mb-8">Trending Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((article) => (
              <CardImage
                key={article.id}
                src={article.image}
                alt={article.title}
                headline={article.title}
                slug={article.slug}
                body={article.excerpt}
                blurDataURL={article.blurDataURL}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function HomePage() {
  return <CachedHomeContent />;
}

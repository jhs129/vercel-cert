import { generateBlurPlaceholder } from "@/lib/image-utils";
import type { Article } from "@/lib/articles-api";
import CardImage from "@/components/ui/CardImage";

interface TrendingArticlesProps {
  articles: Article[];
}

export async function TrendingArticles({ articles }: TrendingArticlesProps) {
  const articlesWithBlur = await Promise.all(
    articles.map(async (a) => ({
      ...a,
      blurDataURL: a.image ? await generateBlurPlaceholder(a.image) : undefined,
    }))
  );

  return (
    <section className="mt-20 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">Trending Articles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articlesWithBlur.map((a) => (
          <CardImage
            key={a.id}
            src={a.image}
            alt={a.title}
            headline={a.title}
            slug={a.slug}
            body={a.excerpt}
            blurDataURL={a.blurDataURL}
          />
        ))}
      </div>
    </section>
  );
}

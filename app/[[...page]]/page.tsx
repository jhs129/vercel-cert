import CardImage from "@/components/ui/CardImage";
import { generateBlurPlaceholder } from "@/lib/image-utils";
import { fetchTrendingArticles } from "@/lib/articles-api";

export default async function TrendingHomePage() {
  const articles = await fetchTrendingArticles();

  const articlesWithBlur = await Promise.all(
    articles.slice(0, 3).map(async (article) => ({
      ...article,
      blurDataURL: article.image ? await generateBlurPlaceholder(article.image) : undefined,
    }))
  );

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold mb-8">Trending Articles</h2>
      {articlesWithBlur.length === 0 ? (
        <p className="text-muted">No articles available right now. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesWithBlur.map((article) => (
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
      )}
    </section>
  );
}

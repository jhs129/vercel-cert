import CardImage from "@/components/ui/CardImage";
import { generateBlurPlaceholder } from "@/lib/image-utils";

const API_BASE = process.env.API_BASE ?? "https://vercel-daily-news-api.vercel.app";

interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
}

async function fetchTrendingArticles(): Promise<TrendingArticle[]> {
  const token = process.env.API_BYPASS_TOKEN;
  try {
    const res = await fetch(`${API_BASE}/api/articles/trending`, {
      headers: token ? { "x-vercel-protection-bypass": token } : {},
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: TrendingArticle[] };
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function TrendingHomePage() {
  const articles = await fetchTrendingArticles();

  const articlesWithBlur = await Promise.all(
    articles.map(async (article) => ({
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

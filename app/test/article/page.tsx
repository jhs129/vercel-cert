import Image from "next/image";

interface MockArticle {
  title: string;
  category: string;
  author: { name: string; avatar: string };
  publishedAt: string;
  tags: string[];
  image?: string;
  content: { type: "paragraph" | "unordered-list"; text?: string; items?: string[] }[];
}

function AuthorAvatar({ name, avatar }: { name: string; avatar: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatar) {
    return <Image src={avatar} alt={name} width={32} height={32} className="rounded-full" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
      {initials}
    </div>
  );
}

function ArticlePreview({ article }: { article: MockArticle }) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <article className="py-8 border border-border rounded-lg p-6">
      {article.image && (
        <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-lg">
          <Image src={article.image} alt={article.title} fill sizes="984px" className="object-cover" quality={80} />
        </div>
      )}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded bg-accent/10 text-accent">
            {article.category}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">{article.title}</h2>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <AuthorAvatar name={article.author.name} avatar={article.author.avatar} />
          <span className="text-sm text-muted">{article.author.name}</span>
          <span className="text-muted" aria-hidden="true">·</span>
          <time className="text-sm text-muted" dateTime={article.publishedAt}>{formattedDate}</time>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full border border-border text-muted">{tag}</span>
            ))}
          </div>
        )}
      </header>
      <div className="prose max-w-none space-y-4">
        {article.content.map((block, i) => {
          if (block.type === "paragraph" && block.text) {
            return <p key={i} className="text-foreground leading-relaxed">{block.text}</p>;
          }
          if (block.type === "unordered-list" && block.items) {
            return (
              <ul key={i} className="list-disc list-inside space-y-2 text-foreground">
                {block.items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            );
          }
          return null;
        })}
      </div>
    </article>
  );
}

const withHero: MockArticle = {
  title: "Vercel Domains Overhauled with Instant Search and At-Cost Pricing",
  category: "changelog",
  author: { name: "Rhys Sullivan", avatar: "" },
  publishedAt: "2025-09-25T00:00:00.000-05:00",
  tags: ["Vercel Domains"],
  image: "https://placehold.co/1200x630.png",
  content: [
    { type: "paragraph", text: "We've rebuilt Vercel Domains end to end, making it faster, simpler, and more affordable to find and buy the right domain for your project." },
    { type: "unordered-list", items: ["Search without login: Look up domains instantly.", "At-cost pricing: Savings up to 50% on popular TLDs.", "Fastest search on the web: Real-time streaming results."] },
  ],
};

const noHero: MockArticle = {
  title: "Edge Case: Article Without a Hero Image",
  category: "blog",
  author: { name: "Jane Doe", avatar: "" },
  publishedAt: "2025-10-01T00:00:00.000-05:00",
  tags: ["edge-case", "testing"],
  content: [
    { type: "paragraph", text: "An article without a hero image still renders the layout correctly with proper spacing and typography." },
  ],
};

export default function ArticleTestPage() {
  return (
    <main className="p-8 space-y-16">
      <h1 className="text-2xl font-bold">Article Layout — Test Page</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted">With hero image, author initials, tags</h2>
        <ArticlePreview article={withHero} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-muted">No hero image</h2>
        <ArticlePreview article={noHero} />
      </section>
    </main>
  );
}

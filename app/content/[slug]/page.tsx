import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { generateBlurPlaceholder } from "@/lib/image-utils";

const API_BASE = process.env.API_BASE ?? "https://vercel-daily-news-api.vercel.app";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Vercel News Site";

interface ContentBlock {
  type: "paragraph" | "unordered-list";
  text?: string;
  items?: string[];
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  category: string;
  author: { name: string; avatar: string };
  image: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
}

const fetchArticle = cache(async (slug: string): Promise<Article | null> => {
  const token = process.env.API_BYPASS_TOKEN;
  const res = await fetch(`${API_BASE}/api/articles/${slug}`, {
    headers: token ? { "x-vercel-protection-bypass": token } : {},
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json() as { success: boolean; data: Article };
  return json.success ? json.data : null;
});

function parseInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return <strong key={i}>{seg.slice(2, -2)}</strong>;
    }
    const link = seg.match(/^\[(.+)\]\((.+)\)$/);
    if (link) {
      const isExternal = /^https?:\/\//i.test(link[2]);
      return (
        <a
          key={i}
          href={link[2]}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-accent underline hover:opacity-80"
        >
          {link[1]}
        </a>
      );
    }
    return seg;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: "Not Found", robots: { index: false, follow: false } };
  const canonicalUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, "")}/content/${slug}` : undefined;
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      siteName: SITE_NAME,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(article.image ? { images: [{ url: article.image, alt: article.title }] } : {}),
    },
    twitter: {
      card: article.image ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt,
      ...(article.image ? { images: [article.image] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const authorInitials = article.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const heroBlur = article.image ? await generateBlurPlaceholder(article.image) : undefined;

  return (
    <article className="py-8">
      {article.image && (
        <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-lg">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 984px"
            className="object-cover"
            quality={80}
            priority
            placeholder={heroBlur ? "blur" : "empty"}
            blurDataURL={heroBlur}
          />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded bg-accent/10 text-accent">
            {article.category}
          </span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {article.author.avatar ? (
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
              {authorInitials}
            </div>
          )}
          <span className="text-sm text-muted">{article.author.name}</span>
          <span className="text-muted" aria-hidden="true">·</span>
          <time className="text-sm text-muted" dateTime={article.publishedAt}>{formattedDate}</time>
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full border border-border text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose max-w-none space-y-4">
        {article.content.map((block, i) => {
          if (block.type === "paragraph" && block.text) {
            return (
              <p key={i} className="text-foreground leading-relaxed">
                {parseInline(block.text)}
              </p>
            );
          }
          if (block.type === "unordered-list" && block.items) {
            return (
              <ul key={i} className="list-disc list-inside space-y-2 text-foreground">
                {block.items.map((item, j) => (
                  <li key={j}>{parseInline(item)}</li>
                ))}
              </ul>
            );
          }
          return null;
        })}
      </div>
    </article>
  );
}

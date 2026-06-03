import { cacheLife, cacheTag } from "next/cache";

const API_BASE = process.env.API_BASE ?? "https://vercel-daily-news-api.vercel.app";

export interface ContentBlock {
  type: "paragraph" | "unordered-list";
  text?: string;
  items?: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content?: ContentBlock[];
  category?: string;
  author?: { name: string; avatar: string };
  publishedAt?: string;
  featured?: boolean;
  tags?: string[];
}

async function newsFetch(path: string): Promise<Response> {
  const token = process.env.API_BYPASS_TOKEN;
  return fetch(`${API_BASE}${path}`, {
    headers: token ? { "x-vercel-protection-bypass": token } : {},
  });
}

export async function fetchTrendingArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("trending");
  try {
    const res = await newsFetch("/api/articles/trending");
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Article[] };
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `article-${slug}`);
  const res = await newsFetch(`/api/articles/${slug}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: Article };
  return json.success ? json.data : null;
}

export interface Category {
  slug: string;
  name: string;
  articleCount: number;
}

export async function fetchCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  cacheTag("categories");
  try {
    const res = await newsFetch("/api/categories");
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Category[] };
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchArticlesByCategory(
  category?: string,
  limit = 100
): Promise<Article[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("articles", category ? `category-${category}` : "all-articles");
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (category) params.set("category", category);
    const res = await newsFetch(`/api/articles?${params}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Article[] };
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchArticlesBySearch(
  query: string,
  category?: string | null,
  limit = 20
): Promise<Article[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 300 });
  cacheTag("search");
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (query) params.set("search", query);
    if (category) params.set("category", category);
    const res = await newsFetch(`/api/articles?${params}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Article[] };
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchAllArticleSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("days");
  cacheTag("slugs");
  try {
    const res = await newsFetch("/api/articles?limit=500");
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Article[] };
    return json.success ? json.data.map((a) => a.slug) : [];
  } catch {
    return [];
  }
}

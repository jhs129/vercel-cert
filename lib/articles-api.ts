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
    next: { revalidate: 60 },
  });
}

export async function fetchTrendingArticles(): Promise<Article[]> {
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

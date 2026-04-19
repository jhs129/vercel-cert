import { fetchOneEntry, fetchEntries, isPreviewing, getBuilderSearchParams } from "@builder.io/sdk-react";
import { cache } from "react";
import type { CmsArticle } from "@/lib/cms-models";

export const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";

if (!BUILDER_API_KEY) {
  console.error(
    "[builder] NEXT_PUBLIC_BUILDER_API_KEY is not set — all Builder.io fetches will fail"
  );
}

export const safeFetch = async (input: string, init?: object) => {
  const res = await fetch(input, init as RequestInit);
  if (!res.ok) return new Response(JSON.stringify({ results: [] }), { status: 200 });
  return res;
};

export const getPageContent = cache(
  async (urlPath: string, searchParams: Record<string, string | string[]>) => {
    const previewing = isPreviewing(searchParams);
    try {
      return await fetchOneEntry({
        model: "page",
        apiKey: BUILDER_API_KEY,
        userAttributes: { urlPath },
        options: getBuilderSearchParams(searchParams),
        includeUnpublished: previewing,
        fetch: safeFetch,
      });
    } catch (err) {
      console.error(
        "[getPageContent] fetchOneEntry threw for path %s — metadata and page will use defaults/notFound",
        urlPath,
        err
      );
      return null;
    }
  }
);

export const getArticleContent = cache(
  async (slug: string, searchParams: Record<string, string | string[]>) => {
    const previewing = isPreviewing(searchParams);
    try {
      return await fetchOneEntry({
        model: "article",
        apiKey: BUILDER_API_KEY,
        userAttributes: { urlPath: `/content/${slug}` },
        query: { 'data.slug': slug },
        options: getBuilderSearchParams(searchParams),
        includeUnpublished: previewing,
        fetch: safeFetch,
      });
    } catch (err) {
      console.error(
        "[getArticleContent] fetchOneEntry threw for slug %s",
        slug,
        err
      );
      return null;
    }
  }
);

export function buildUrlPath(page?: string[]): string {
  return "/" + (page?.join("/") ?? "");
}

function entryToArticle(entry: { id?: string; name?: string; published?: string; data?: Record<string, unknown> | null }): CmsArticle {
  const d = entry.data ?? {};
  return {
    id: entry.id ?? "",
    name: entry.name ?? "",
    published: entry.published ?? "",
    data: {
      slug: d.slug as string | undefined,
      title: d.title as string | undefined,
      categories: d.categories as string[] | undefined,
      metadata: d.metadata as CmsArticle["data"]["metadata"],
      publishDate: d.publishDate as number | undefined,
    },
  };
}

export const fetchArticleCategories = async (): Promise<string[]> => {
  try {
    const entries = await fetchEntries({
      model: "article",
      apiKey: BUILDER_API_KEY,
      options: { limit: 100, fields: "data.categories" },
      fetch: safeFetch,
    });
    const cats = new Set<string>();
    for (const entry of entries ?? []) {
      const categories = (entry.data as Record<string, unknown>)?.categories as string[] | undefined;
      categories?.forEach((c) => cats.add(c));
    }
    return Array.from(cats).sort();
  } catch (err) {
    console.error("[fetchArticleCategories] threw", err);
    return [];
  }
};

export const fetchArticles = async (limit = 5): Promise<CmsArticle[]> => {
  try {
    const entries = await fetchEntries({
      model: "article",
      apiKey: BUILDER_API_KEY,
      options: { limit, sort: { "data.publishDate": -1 } },
      fetch: safeFetch,
    });
    return (entries ?? []).map(entryToArticle);
  } catch (err) {
    console.error("[fetchArticles] threw", err);
    return [];
  }
};

export const searchArticles = async (
  query: string,
  category?: string | null
): Promise<CmsArticle[]> => {
  try {
    const builtQuery: Record<string, unknown> = {};
    if (query) builtQuery["data.title"] = { $regex: query, $options: "i" };
    if (category) builtQuery["data.categories"] = category;

    const entries = await fetchEntries({
      model: "article",
      apiKey: BUILDER_API_KEY,
      query: builtQuery,
      options: { limit: 5, sort: { "data.publishDate": -1 } },
      fetch: safeFetch,
    });
    return (entries ?? []).map(entryToArticle);
  } catch (err) {
    console.error("[searchArticles] threw", err);
    return [];
  }
};

import { fetchOneEntry, isPreviewing, getBuilderSearchParams } from "@builder.io/sdk-react";
import { cache } from "react";

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

export function buildUrlPath(page?: string[]): string {
  return "/" + (page?.join("/") ?? "");
}

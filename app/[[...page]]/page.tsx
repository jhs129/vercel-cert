import { fetchOneEntry, isPreviewing, getBuilderSearchParams } from "@builder.io/sdk-react";
import { notFound } from "next/navigation";
import { BuilderPageClient } from "./BuilderPageClient";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";

const safeFetch = async (input: string, init?: object) => {
  const res = await fetch(input, init as RequestInit);
  if (!res.ok) return new Response(JSON.stringify({ results: [] }), { status: 200 });
  return res;
};

export default async function BuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ page?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { page } = await params;
  const resolvedSearchParams = await searchParams;
  const urlPath = "/" + (page?.join("/") ?? "");

  const previewing = isPreviewing(resolvedSearchParams);

  const content = await fetchOneEntry({
    model: "page",
    apiKey: BUILDER_API_KEY,
    userAttributes: { urlPath },
    options: getBuilderSearchParams(resolvedSearchParams),
    includeUnpublished: previewing,
    fetch: safeFetch,
  });

  if (!content && !previewing) {
    notFound();
  }

  return <BuilderPageClient content={content} apiKey={BUILDER_API_KEY} />;
}

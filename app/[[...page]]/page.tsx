import { fetchOneEntry, isPreviewing, getBuilderSearchParams } from "@builder.io/sdk-react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import type { Metadata } from "next";
import { BuilderPageClient } from "./BuilderPageClient";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SITE_NAME = "Vercel Cert";
const DEFAULT_TITLE = "Vercel Cert";
const DEFAULT_DESCRIPTION = "Built with Next.js and Builder.io on Vercel.";

const safeFetch = async (input: string, init?: object) => {
  const res = await fetch(input, init as RequestInit);
  if (!res.ok) return new Response(JSON.stringify({ results: [] }), { status: 200 });
  return res;
};

const getPageContent = cache(
  async (urlPath: string, searchParams: Record<string, string | string[]>) => {
    const previewing = isPreviewing(searchParams);
    return fetchOneEntry({
      model: "page",
      apiKey: BUILDER_API_KEY,
      userAttributes: { urlPath },
      options: getBuilderSearchParams(searchParams),
      includeUnpublished: previewing,
      fetch: safeFetch,
    });
  }
);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ page?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}): Promise<Metadata> {
  const { page } = await params;
  const resolvedSearchParams = await searchParams;
  const urlPath = "/" + (page?.join("/") ?? "");

  const content = await getPageContent(urlPath, resolvedSearchParams);

  const title = (content?.data?.title as string | undefined) || DEFAULT_TITLE;
  const meta = content?.data?.metadata as Record<string, unknown> | undefined;
  const description = (meta?.description as string | undefined) || DEFAULT_DESCRIPTION;
  const media = meta?.media as string | undefined;
  const rawKeywords = meta?.keywords;

  let keywords: string[] | undefined;
  if (Array.isArray(rawKeywords) && rawKeywords.length) {
    keywords = rawKeywords as string[];
  } else if (typeof rawKeywords === "string" && rawKeywords.trim()) {
    keywords = rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? urlPath;
  const canonicalUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, "")}${pathname}` : undefined;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    openGraph: {
      type: "website",
      title,
      description,
      siteName: SITE_NAME,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(media ? { images: [{ url: media, alt: title }] } : {}),
    },
    twitter: {
      card: media ? "summary_large_image" : "summary",
      title,
      description,
      ...(media ? { images: [media] } : {}),
    },
  };
}

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

  const content = await getPageContent(urlPath, resolvedSearchParams);

  if (!content && !previewing) {
    notFound();
  }

  return <BuilderPageClient content={content} apiKey={BUILDER_API_KEY} />;
}

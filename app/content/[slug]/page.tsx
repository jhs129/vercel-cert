import { isPreviewing } from "@builder.io/sdk-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUILDER_API_KEY, getArticleContent } from "@/lib/builder";
import { ArticleClient } from "./ArticleClient";

const DEFAULT_TITLE = "Article";
const DEFAULT_DESCRIPTION = "";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const content = await getArticleContent(slug, resolvedSearchParams);

  if (!content && !isPreviewing(resolvedSearchParams)) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const title = (content?.data?.title as string | undefined) || DEFAULT_TITLE;
  const meta = content?.data?.metadata as Record<string, unknown> | undefined;
  const description = (meta?.description as string | undefined) || DEFAULT_DESCRIPTION;
  const rawKeywords = meta?.keywords;

  let keywords: string[] | undefined;
  if (Array.isArray(rawKeywords) && rawKeywords.length) {
    keywords = rawKeywords as string[];
  } else if (typeof rawKeywords === "string" && rawKeywords.trim()) {
    keywords = rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  }

  return {
    title,
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const previewing = isPreviewing(resolvedSearchParams);
  const content = await getArticleContent(slug, resolvedSearchParams);

  if (!content && !previewing) {
    notFound();
  }

  const title = (content?.data?.title as string | undefined) ?? "";
  const publishDate = content?.data?.publishDate as number | undefined;
  const meta = content?.data?.metadata as Record<string, unknown> | undefined;
  const heroImage = meta?.media as string | undefined;

  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <ArticleClient
      content={content}
      apiKey={BUILDER_API_KEY}
      title={title}
      formattedDate={formattedDate}
      heroImage={heroImage}
    />
  );
}

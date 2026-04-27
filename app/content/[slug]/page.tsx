import { isPreviewing } from "@builder.io/sdk-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUILDER_API_KEY, getArticleContent } from "@/lib/builder";
import { isSubscribedServer } from "@/lib/subscription.server";
import { ArticleClient } from "./ArticleClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SITE_NAME = "Vercel News Site";
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
  const media = (meta?.media as string | undefined) || undefined;
  const rawKeywords = meta?.keywords;

  let keywords: string[] | undefined;
  if (Array.isArray(rawKeywords) && rawKeywords.length) {
    keywords = rawKeywords as string[];
  } else if (typeof rawKeywords === "string" && rawKeywords.trim()) {
    keywords = rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  }

  const canonicalUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, "")}/content/${slug}` : undefined;

  return {
    title,
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    openGraph: {
      type: "article",
      title,
      ...(description ? { description } : {}),
      siteName: SITE_NAME,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(media ? { images: [{ url: media, alt: title }] } : {}),
    },
    twitter: {
      card: media ? "summary_large_image" : "summary",
      title,
      ...(description ? { description } : {}),
      ...(media ? { images: [media] } : {}),
    },
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
  const [content, subscribed] = await Promise.all([
    getArticleContent(slug, resolvedSearchParams),
    isSubscribedServer(),
  ]);

  if (!content && !previewing) {
    notFound();
  }

  const title = (content?.data?.title as string | undefined) ?? "";
  const publishDate = content?.data?.publishDate as number | undefined;
  const meta = content?.data?.metadata as Record<string, unknown> | undefined;
  const heroImage = meta?.media as string | undefined;
  const teaser = ((meta?.description as string | undefined) ?? "").slice(0, 255);

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
      content={subscribed || previewing ? content : null}
      apiKey={BUILDER_API_KEY}
      title={title}
      formattedDate={formattedDate}
      heroImage={heroImage}
      teaser={teaser}
      initialSubscribed={subscribed}
    />
  );
}

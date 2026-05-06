import { isPreviewing } from "@builder.io/sdk-react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { BuilderPageClient } from "./BuilderPageClient";
import TrendingHomePage from "./TrendingHomePage";
import { BUILDER_API_KEY, getPageContent, buildUrlPath } from "@/lib/builder";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SITE_NAME = "Vercel Cert";
const DEFAULT_TITLE = "Vercel Cert";
const DEFAULT_DESCRIPTION = "Built with Next.js and Builder.io on Vercel.";

if (!SITE_URL) {
  console.warn(
    "[page.tsx] NEXT_PUBLIC_SITE_URL is not set — canonical URLs and og:url will be omitted from all pages"
  );
}

function extractString(value: unknown, fieldName: string, urlPath: string): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (value !== undefined && value !== null) {
    console.warn(
      "[generateMetadata] content.data.%s has unexpected type %s for path %s",
      fieldName,
      typeof value,
      urlPath
    );
  }
  return undefined;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ page?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}): Promise<Metadata> {
  const { page } = await params;
  const resolvedSearchParams = await searchParams;
  const urlPath = buildUrlPath(page);

  if (urlPath === "/") {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  }

  const content = await getPageContent(urlPath, resolvedSearchParams);

  if (!content && !isPreviewing(resolvedSearchParams)) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const meta = content?.data?.metadata as Record<string, unknown> | undefined;

  const title = extractString(content?.data?.title, "title", urlPath) ?? DEFAULT_TITLE;
  const description = extractString(meta?.description, "metadata.description", urlPath) ?? DEFAULT_DESCRIPTION;
  const media = extractString(meta?.media, "metadata.media", urlPath);
  const rawKeywords = meta?.keywords;

  let keywords: string[] | undefined;
  if (Array.isArray(rawKeywords) && rawKeywords.length) {
    keywords = rawKeywords as string[];
  } else if (typeof rawKeywords === "string" && rawKeywords.trim()) {
    keywords = rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  }

  const headersList = await headers();
  const xPathname = headersList.get("x-pathname");
  if (!xPathname && process.env.NODE_ENV === "development") {
    console.warn(
      "[generateMetadata] x-pathname header is missing — middleware (proxy.ts) may not be running. Falling back to: %s",
      urlPath
    );
  }
  const pathname = xPathname ?? urlPath;
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
  const urlPath = buildUrlPath(page);

  if (urlPath === "/") {
    return <TrendingHomePage />;
  }

  const previewing = isPreviewing(resolvedSearchParams);
  const content = await getPageContent(urlPath, resolvedSearchParams);

  if (!content && !previewing) {
    notFound();
  }

  return <BuilderPageClient content={content} apiKey={BUILDER_API_KEY} />;
}

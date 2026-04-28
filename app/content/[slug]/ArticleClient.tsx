"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { isPreviewing } from "@builder.io/sdk-react";
import type { BuilderContent } from "@builder.io/sdk-react";
import { PaywallBanner } from "@/components/ui/PaywallBanner";
import { useRouter } from "next/navigation";

// Load Builder.io Content client-side only to prevent its inline <script> tag
// from appearing in SSR output, which triggers a React 19 console error.
const ArticleContent = dynamic(() => import("./ArticleContent"), { ssr: false });

interface ArticleClientProps {
  content: BuilderContent | null;
  apiKey: string;
  title: string;
  formattedDate: string | null;
  heroImage: string | undefined;
  teaser: string;
  initialSubscribed: boolean;
}

function sanitizeValue<T>(value: T): T {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<script\b[^>]*\/?>/gi, "") as T;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item) => {
        if (!item || typeof item !== "object") return true;
        const candidate = item as Record<string, unknown>;
        const tagName = candidate.tagName;
        const component = candidate.component as Record<string, unknown> | undefined;
        return (
          !(typeof tagName === "string" && tagName.toLowerCase() === "script") &&
          !(typeof component?.name === "string" && component.name.toLowerCase() === "script")
        );
      }) as T;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sanitizedEntries = Object.entries(record).map(([key, nestedValue]) => [
      key,
      sanitizeValue(nestedValue),
    ]);

    return Object.fromEntries(sanitizedEntries) as T;
  }

  return value;
}

function sanitizeBuilderContent(content: BuilderContent | null): BuilderContent | null {
  if (!content) return content;
  return sanitizeValue(content);
}

export function ArticleClient({
  content,
  apiKey,
  title,
  formattedDate,
  heroImage,
  teaser,
  initialSubscribed,
}: ArticleClientProps) {
  // Tracks the window between clicking Subscribe and the server refresh delivering content.
  // Avoids stale-state bugs by deriving paywall visibility from the server prop (initialSubscribed)
  // rather than maintaining a duplicate subscribed state that can drift.
  const [subscribePending, setSubscribePending] = useState(false);
  const router = useRouter();
  const sanitizedContent = useMemo(() => sanitizeBuilderContent(content), [content]);

  if (subscribePending && !sanitizedContent && !isPreviewing()) {
    return (
      <div className="max-w-3xl mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted">Loading article…</p>
      </div>
    );
  }

  if (!initialSubscribed && !sanitizedContent && !isPreviewing()) {
    return (
      <PaywallBanner
        title={title}
        heroImage={heroImage}
        teaser={teaser}
        onSubscribe={() => {
          setSubscribePending(true);
          router.refresh();
        }}
      />
    );
  }

  if (!sanitizedContent && !isPreviewing()) return null;

  return (
    <article className="py-8">
      {heroImage && (
        <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-lg">
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 984px"
            className="object-cover"
            quality={80}
            priority
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
          {title}
        </h1>
        {formattedDate && (
          <time className="text-muted text-sm">{formattedDate}</time>
        )}
      </header>

      <div className="prose max-w-none">
        <ArticleContent
          model="article"
          content={sanitizedContent}
          apiKey={apiKey}
          canTrack={false}
        />
      </div>
    </article>
  );
}

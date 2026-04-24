"use client";

import { useState } from "react";
import { Content, isPreviewing } from "@builder.io/sdk-react";
import type { BuilderContent } from "@builder.io/sdk-react";
import { PaywallBanner } from "@/components/ui/PaywallBanner";
import { useRouter } from "next/navigation";

interface ArticleClientProps {
  content: BuilderContent | null;
  apiKey: string;
  title: string;
  formattedDate: string | null;
  heroImage: string | undefined;
  teaser: string;
  initialSubscribed: boolean;
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

  if (subscribePending && !content && !isPreviewing()) {
    return (
      <div className="max-w-3xl mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted">Loading article…</p>
      </div>
    );
  }

  if (!initialSubscribed && !content && !isPreviewing()) {
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

  if (!content && !isPreviewing()) return null;

  return (
    <article className="max-w-3xl mx-auto py-8">
      {heroImage && (
        <div className="w-full aspect-video mb-8 overflow-hidden rounded-lg">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover"
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
        <Content
          model="article"
          content={content}
          apiKey={apiKey}
          canTrack={false}
        />
      </div>
    </article>
  );
}

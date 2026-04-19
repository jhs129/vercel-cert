"use client";

import { Content, isPreviewing } from "@builder.io/sdk-react";
import type { BuilderContent } from "@builder.io/sdk-react";

interface ArticleClientProps {
  content: BuilderContent | null;
  apiKey: string;
  title: string;
  publishDate: number | undefined;
  heroImage: string | undefined;
}

export function ArticleClient({
  content,
  apiKey,
  title,
  publishDate,
  heroImage,
}: ArticleClientProps) {
  if (!content && !isPreviewing()) return null;

  const formattedDate =
    publishDate
      ? new Date(publishDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
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

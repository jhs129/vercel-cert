"use client";

import { Content, isPreviewing } from "@builder.io/sdk-react";
import type { BuilderContent } from "@builder.io/sdk-react";
import { customComponents } from "@/lib/builder-registry";

interface BuilderPageClientProps {
  content: BuilderContent | null;
  apiKey: string;
}

export function BuilderPageClient({ content, apiKey }: BuilderPageClientProps) {
  if (!content && !isPreviewing()) return null;

  return (
    <Content
      model="page"
      content={content}
      apiKey={apiKey}
      canTrack={false}
      customComponents={customComponents}
    />
  );
}

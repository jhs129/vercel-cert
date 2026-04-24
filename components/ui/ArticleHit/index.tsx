import type { ReactNode } from "react";
import Link from "next/link";

interface ArticleHitProps {
  title: string;
  slug: string;
}

export function ArticleHit({ title, slug }: ArticleHitProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold">
        <Link href={`/content/${slug}`}>{title}</Link>
      </h3>
    </div>
  );
}

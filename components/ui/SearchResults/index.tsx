import Link from "next/link";
import Image from "next/image";
import type { CmsArticle } from "@/lib/cms-models";

interface SearchResultsProps {
  articles: CmsArticle[];
}

function formatDate(publishDate?: number): string {
  if (!publishDate) return "";
  return new Date(publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SearchResults({ articles }: SearchResultsProps) {
  if (!articles.length) return null;

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
      {articles.map((article) => (
        <li key={article.id} className="h-full">
          <Link
            href={`/content/${article.data.slug ?? article.id}`}
            className="group flex flex-col h-full rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
              {article.data.metadata?.media ? (
                <Image
                  src={article.data.metadata.media}
                  alt={article.data.title ?? ""}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-muted/20" />
              )}
            </div>
            <div className="flex flex-col flex-1 gap-2 p-4">
              <h3 className="text-base font-semibold leading-snug line-clamp-2 text-foreground">
                {article.data.title ?? "Untitled"}
              </h3>
              {article.data.publishDate && (
                <p className="text-xs text-muted">{formatDate(article.data.publishDate)}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

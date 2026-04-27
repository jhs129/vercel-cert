import Link from "next/link";

interface ArticleHitProps {
  title: string;
  slug: string;
  publishDate?: number;
  description?: string;
  categories?: string[];
}

export function ArticleHit({ title, slug, publishDate, description, categories }: ArticleHitProps) {
  const formattedDate = publishDate
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(publishDate)
      )
    : null;

  return (
    <div className="flex flex-col gap-1 border-b border-border pb-4">
      <h3 className="text-lg font-bold mb-0">
        <Link href={`/content/${slug}`}>{title}</Link>
      </h3>
      {formattedDate && <div className="text-sm text-muted">{formattedDate}</div>}
      {description && <div className="text-sm">{description}</div>}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

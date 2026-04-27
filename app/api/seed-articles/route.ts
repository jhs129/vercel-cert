import { NextRequest, NextResponse } from "next/server";

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";
function checkAuth(request: NextRequest): Response | null {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }
  if (!PRIVATE_KEY) {
    return NextResponse.json({ error: "BUILDER_PRIVATE_KEY is not set" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${PRIVATE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
const WRITE_API = "https://builder.io/api/v1/write";
const CONTENT_API = "https://cdn.builder.io/api/v3/content";
const BLOG_BASE = "https://vercel.com/blog";
const PLACEHOLDER_IMAGE = "https://placehold.co/1200x630.png";

interface ArticleItem {
  slug: string;
  title: string;
  description: string;
  publishDate: number;
}

function extractMeta(html: string, property: string): string {
  const match = html.match(new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`, "i"))
    ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${property}"`, "i"));
  return match?.[1]?.trim() ?? "";
}

function extractTitle(html: string): string {
  const og = extractMeta(html, "og:title");
  if (og) return og.replace(/\s*[-–|]\s*Vercel.*$/i, "").trim();
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return (match?.[1] ?? "").replace(/\s*[-–|]\s*Vercel.*$/i, "").trim();
}

async function fetchBlogSlugs(limit: number): Promise<string[]> {
  const res = await fetch(BLOG_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error(`Blog listing returned ${res.status}`);
  const html = await res.text();
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const [, slug] of html.matchAll(/href="\/blog\/([a-z0-9][a-z0-9-]*[a-z0-9])"/gi)) {
    if (!slug.startsWith("category/") && !seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
      if (slugs.length >= limit) break;
    }
  }
  return slugs;
}

async function fetchArticleMeta(slug: string, index: number, total: number): Promise<ArticleItem> {
  const res = await fetch(`${BLOG_BASE}/${slug}`, { cache: "no-store" });
  const html = res.ok ? await res.text() : "";
  const title = extractTitle(html) || slug;
  const description = extractMeta(html, "og:description") || extractMeta(html, "description") || "";
  // Spread publish dates evenly across the last 18 months
  const now = Date.now();
  const eighteenMonthsAgo = now - 18 * 30 * 24 * 60 * 60 * 1000;
  const publishDate = Math.round(eighteenMonthsAgo + (index / Math.max(total - 1, 1)) * (now - eighteenMonthsAgo));
  return { slug, title, description, publishDate };
}

async function findExistingArticle(slug: string): Promise<string | null> {
  const query = encodeURIComponent(JSON.stringify({ "data.slug": slug }));
  const url = `${CONTENT_API}/article?apiKey=${PUBLIC_KEY}&query=${query}&limit=1&includeUnpublished=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${PRIVATE_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json() as { results?: { id: string }[] };
  return data.results?.[0]?.id ?? null;
}

async function upsertArticle(
  item: ArticleItem
): Promise<{ slug: string; action: "created" | "updated"; id: string }> {
  const existingId = await findExistingArticle(item.slug);

  const body = {
    name: item.title,
    published: "draft",
    data: {
      slug: item.slug,
      title: item.title,
      testData: true,
      publishDate: item.publishDate,
      metadata: {
        description: item.description.slice(0, 255),
        media: PLACEHOLDER_IMAGE,
      },
      blocks: [
        {
          "@type": "@builder.io/sdk:Element",
          component: {
            name: "Text",
            options: { text: `<p>${item.description}</p>` },
          },
        },
      ],
    },
  };

  if (existingId) {
    const res = await fetch(`${WRITE_API}/article/${existingId}?triggerWebhooks=false`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { id?: string };
    return { slug: item.slug, action: "updated", id: data.id ?? existingId };
  }

  const res = await fetch(`${WRITE_API}/article?triggerWebhooks=false`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json() as { id?: string };
  return { slug: item.slug, action: "created", id: data.id ?? "" };
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  if (!PRIVATE_KEY) {
    return NextResponse.json({ error: "BUILDER_PRIVATE_KEY is not set" }, { status: 500 });
  }

  const reqBody = await request.json().catch(() => ({})) as Record<string, unknown>;
  const count = Math.min(Math.max(1, Number(reqBody.count ?? 50)), 100);

  let slugs: string[];
  try {
    slugs = await fetchBlogSlugs(count);
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch blog listing: ${String(err)}` }, { status: 502 });
  }

  if (!slugs.length) {
    return NextResponse.json({ error: "No articles found on blog listing page" }, { status: 500 });
  }

  const items = await Promise.all(slugs.map((slug, i) => fetchArticleMeta(slug, i, slugs.length)));

  const results: Awaited<ReturnType<typeof upsertArticle>>[] = [];
  for (const item of items) {
    results.push(await upsertArticle(item));
  }

  return NextResponse.json({
    requested: count,
    created: results.filter((r) => r.action === "created").length,
    updated: results.filter((r) => r.action === "updated").length,
    total: results.length,
    articles: results,
  });
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  if (!PRIVATE_KEY) {
    return NextResponse.json({ error: "BUILDER_PRIVATE_KEY is not set" }, { status: 500 });
  }

  let offset = 0;
  let deleted = 0;

  for (;;) {
    const query = encodeURIComponent(JSON.stringify({ "data.testData": true }));
    const res = await fetch(
      `${CONTENT_API}/article?apiKey=${PUBLIC_KEY}&query=${query}&limit=100&offset=${offset}&includeUnpublished=true`,
      { headers: { Authorization: `Bearer ${PRIVATE_KEY}` }, cache: "no-store" }
    );
    if (!res.ok) break;
    const data = await res.json() as { results?: { id: string }[] };
    if (!data.results?.length) break;

    await Promise.all(
      data.results.map((entry) =>
        fetch(`${WRITE_API}/article/${entry.id}?triggerWebhooks=false`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${PRIVATE_KEY}` },
        })
      )
    );
    deleted += data.results.length;

    if (data.results.length < 100) break;
    offset += 100;
  }

  return NextResponse.json({ deleted });
}

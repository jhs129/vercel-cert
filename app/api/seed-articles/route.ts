import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

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

interface BuilderBlock {
  "@type": "@builder.io/sdk:Element";
  component: {
    name: string;
    options: Record<string, unknown>;
  };
}

interface ArticleItem {
  slug: string;
  title: string;
  description: string;
  publishDate: number;
  blocks: BuilderBlock[];
  categories: string[];
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

async function fetchBlogSlugs(limit: number, category?: string): Promise<string[]> {
  const url = category ? `${BLOG_BASE}/category/${encodeURIComponent(category)}` : BLOG_BASE;
  const res = await fetch(url, { cache: "no-store" });
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

function extractCategories(html: string): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const [, cat] of html.matchAll(/href="\/blog\/category\/([a-z0-9][a-z0-9-]*)"/gi)) {
    if (!seen.has(cat)) {
      seen.add(cat);
      categories.push(cat);
    }
  }
  return categories;
}

function markdownToBlocks(markdown: string): BuilderBlock[] {
  const blocks: BuilderBlock[] = [];
  // Remove front matter if present
  const body = markdown.replace(/^---[\s\S]*?---\n?/, "").trim();

  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<h1>${trimmed.slice(2)}</h1>` } } });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<h2>${trimmed.slice(3)}</h2>` } } });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<h3>${trimmed.slice(4)}</h3>` } } });
    } else if (trimmed.startsWith("![")) {
      // skip image embeds
    } else if (trimmed.startsWith(">")) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<blockquote>${trimmed.slice(1).trim()}</blockquote>` } } });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<p>${trimmed.slice(2)}</p>` } } });
    } else if (/^\d+\. /.test(trimmed)) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<p>${trimmed.replace(/^\d+\. /, "")}</p>` } } });
    } else if (!trimmed.startsWith("```") && !trimmed.startsWith("|")) {
      blocks.push({ "@type": "@builder.io/sdk:Element", component: { name: "Text", options: { text: `<p>${trimmed}</p>` } } });
    }
  }

  return blocks.length ? blocks : [];
}

async function fetchArticleMeta(slug: string, index: number, total: number, knownCategory?: string): Promise<ArticleItem> {
  const url = `${BLOG_BASE}/${slug}`;
  // Fetch HTML for meta tags and markdown for body content in parallel
  const [htmlRes, mdRes] = await Promise.all([
    fetch(url, { cache: "no-store" }),
    fetch(url, { cache: "no-store", headers: { Accept: "text/markdown" } }),
  ]);

  const html = htmlRes.ok ? await htmlRes.text() : "";
  const markdown = mdRes.ok ? await mdRes.text() : "";

  const title = extractTitle(html) || slug;
  const description = extractMeta(html, "og:description") || extractMeta(html, "description") || "";
  const categories = knownCategory ? [knownCategory] : extractCategories(html);

  const blocks = markdown ? markdownToBlocks(markdown) : [
    { "@type": "@builder.io/sdk:Element" as const, component: { name: "Text", options: { text: `<p>${description}</p>` } } },
  ];

  // Spread publish dates evenly across the last 18 months
  const now = Date.now();
  const eighteenMonthsAgo = now - 18 * 30 * 24 * 60 * 60 * 1000;
  const publishDate = Math.round(eighteenMonthsAgo + (index / Math.max(total - 1, 1)) * (now - eighteenMonthsAgo));

  return { slug, title, description, publishDate, blocks, categories };
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
      ...(item.categories.length ? { categories: item.categories } : {}),
      metadata: {
        description: item.description.slice(0, 255),
        media: PLACEHOLDER_IMAGE,
      },
      blocks: item.blocks,
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

const postBodySchema = z.object({
  count: z.coerce.number().int().min(1).max(100).catch(50),
  category: z.string().trim().min(1).optional(),
});

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const reqId = crypto.randomUUID();

  const ip = getRateLimitKey(request);
  const { allowed, retryAfter } = rateLimit(ip, 10, 60);
  if (!allowed) {
    console.error(`[${reqId}] Rate limit exceeded for IP ${ip} on POST /api/seed-articles`);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }

  const authError = checkAuth(request);
  if (authError) return authError;

  if (!PRIVATE_KEY) {
    return NextResponse.json({ error: "BUILDER_PRIVATE_KEY is not set" }, { status: 500 });
  }

  const rawBody = await request.json().catch(() => ({}));
  const parsed = postBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { count, category } = parsed.data;

  try {
    const slugs = await fetchBlogSlugs(count, category);

    if (!slugs.length) {
      return NextResponse.json({ error: "No articles found on blog listing page" }, { status: 500 });
    }

    const items = await Promise.all(slugs.map((slug, i) => fetchArticleMeta(slug, i, slugs.length, category)));

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
  } catch (err) {
    console.error(`[${reqId}] POST /api/seed-articles unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const reqId = crypto.randomUUID();

  const ip = getRateLimitKey(request);
  const { allowed, retryAfter } = rateLimit(ip, 10, 60);
  if (!allowed) {
    console.error(`[${reqId}] Rate limit exceeded for IP ${ip} on DELETE /api/seed-articles`);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }

  const authError = checkAuth(request);
  if (authError) return authError;

  if (!PRIVATE_KEY) {
    return NextResponse.json({ error: "BUILDER_PRIVATE_KEY is not set" }, { status: 500 });
  }

  try {
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
  } catch (err) {
    console.error(`[${reqId}] DELETE /api/seed-articles unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

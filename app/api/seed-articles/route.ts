import { NextRequest, NextResponse } from "next/server";

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? "";
const WRITE_API = "https://builder.io/api/v1/write";
const CONTENT_API = "https://cdn.builder.io/api/v3/content";
const BLOG_RSS = "https://vercel.com/blog/rss.xml";
const PLACEHOLDER_IMAGE = "https://placehold.co/1200x630.png";

interface RssItem {
  slug: string;
  title: string;
  description: string;
  publishDate: number;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i")
  );
  return match?.[1]?.trim() ?? "";
}

function parseRssItems(xml: string, limit: number): RssItem[] {
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
  return itemBlocks
    .slice(0, limit)
    .map((block) => {
      const link = extractTag(block, "link");
      const slug = link.replace(/^https:\/\/vercel\.com\/blog\//, "").replace(/\/+$/, "");
      const title = extractTag(block, "title");
      const rawDescription = extractTag(block, "description").replace(/<[^>]+>/g, "").trim();
      const pubDateStr = extractTag(block, "pubDate");
      const publishDate = pubDateStr ? new Date(pubDateStr).getTime() : Date.now();
      return { slug, title, description: rawDescription, publishDate };
    })
    .filter((item) => item.slug && item.title);
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
  item: RssItem
): Promise<{ slug: string; action: "created" | "updated"; id: string }> {
  const existingId = await findExistingArticle(item.slug);

  const body = {
    name: item.title,
    published: "published",
    data: {
      slug: item.slug,
      title: item.title,
      testData: true,
      publishDate: item.publishDate,
      metadata: {
        description: item.description.slice(0, 255),
        media: PLACEHOLDER_IMAGE,
      },
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
  if (!PRIVATE_KEY) {
    return NextResponse.json({ error: "BUILDER_PRIVATE_KEY is not set" }, { status: 500 });
  }

  const reqBody = await request.json().catch(() => ({})) as Record<string, unknown>;
  const count = Math.min(Math.max(1, Number(reqBody.count ?? 50)), 100);

  const rssRes = await fetch(BLOG_RSS, { cache: "no-store" });
  if (!rssRes.ok) {
    return NextResponse.json({ error: "Failed to fetch Vercel blog RSS feed" }, { status: 502 });
  }
  const rssXml = await rssRes.text();
  const items = parseRssItems(rssXml, count);

  if (!items.length) {
    return NextResponse.json({ error: "No articles found in RSS feed" }, { status: 500 });
  }

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

export async function DELETE() {
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

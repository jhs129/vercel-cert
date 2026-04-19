import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  return { status: res.status, body: await res.json() };
}

describe("GET /api/search", () => {
  it("returns an array", async () => {
    const { status, body } = await get("/api/search");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it("returns published articles with required fields", async () => {
    const { body } = await get("/api/search");
    expect(body.length).toBeGreaterThan(0);
    for (const article of body) {
      expect(article).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        published: "published",
        data: expect.objectContaining({
          slug: expect.any(String),
          title: expect.any(String),
        }),
      });
    }
  });

  it("filters by text query (case-insensitive)", async () => {
    const { body } = await get("/api/search?q=vercel");
    expect(Array.isArray(body)).toBe(true);
    for (const article of body) {
      expect(article.data.title?.toLowerCase()).toContain("vercel");
    }
  });

  it("returns empty array for query with no matches", async () => {
    const { body } = await get("/api/search?q=zzznomatchxyz999");
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  it("filters by category", async () => {
    // First get all to find a valid category
    const { body: all } = await get("/api/search");
    const category = all[0]?.data?.categories?.[0];
    if (!category) return; // skip if no categories set

    const { body } = await get(`/api/search?category=${encodeURIComponent(category)}`);
    expect(body.length).toBeGreaterThan(0);
    for (const article of body) {
      expect(article.data.categories).toContain(category);
    }
  });

  it("respects the limit param", async () => {
    const { body } = await get("/api/search?limit=1");
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeLessThanOrEqual(1);
  });

  it("caps limit at 50", async () => {
    const { body } = await get("/api/search?limit=999");
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeLessThanOrEqual(50);
  });
});

describe("GET /api/articles", () => {
  it("returns articles and categories", async () => {
    const { status, body } = await get("/api/articles");
    expect(status).toBe(200);
    expect(Array.isArray(body.articles)).toBe(true);
    expect(Array.isArray(body.categories)).toBe(true);
  });

  it("returns at least one published article", async () => {
    const { body } = await get("/api/articles");
    expect(body.articles.length).toBeGreaterThan(0);
    for (const article of body.articles) {
      expect(article.published).toBe("published");
    }
  });

  it("returns non-empty categories", async () => {
    const { body } = await get("/api/articles");
    expect(body.categories.length).toBeGreaterThan(0);
    for (const cat of body.categories) {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    }
  });

  it("respects the limit param", async () => {
    const { body } = await get("/api/articles?limit=2");
    expect(body.articles.length).toBeLessThanOrEqual(2);
  });

  it("articles are sorted newest first", async () => {
    const { body } = await get("/api/articles");
    const dates = body.articles
      .map((a: { data: { publishDate?: number } }) => a.data.publishDate ?? 0)
      .filter((d: number) => d > 0);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });
});

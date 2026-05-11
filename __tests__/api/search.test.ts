import { describe, it, expect } from "vitest";

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

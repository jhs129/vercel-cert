import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchArticles, fetchArticleCategories } from "@/lib/builder";
import { rateLimit } from "@/lib/rate-limit";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).catch(5),
});

export async function GET(request: NextRequest) {
  const reqId = crypto.randomUUID();

  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfter } = rateLimit(ip, 60, 60);
  if (!allowed) {
    console.error(`[${reqId}] Rate limit exceeded for IP ${ip} on /api/articles`);
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
    );
  }

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { limit } = parsed.data;
    const [articles, categories] = await Promise.all([
      fetchArticles(limit),
      fetchArticleCategories(),
    ]);

    return NextResponse.json(
      { articles, categories },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error(`[${reqId}] /api/articles unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchArticles, fetchArticleCategories } from "@/lib/builder";
import { withRateLimit } from "@/lib/api-utils";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).catch(5),
});

export async function GET(request: NextRequest) {
  const { reqId, blocked } = withRateLimit(request, 60, 60, "/api/articles");
  if (blocked) return blocked;

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

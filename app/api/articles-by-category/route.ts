import { NextRequest, NextResponse } from "next/server";
import { fetchArticlesByCategory } from "@/lib/articles-api";
import { withRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { reqId, blocked } = withRateLimit(request, 60, 60, "/api/articles-by-category");
  if (blocked) return blocked;

  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "100", 10), 100);

  try {
    const articles = await fetchArticlesByCategory(category, limit);
    return NextResponse.json(
      { articles },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error(`[${reqId}] /api/articles-by-category unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fetchArticles, fetchArticleCategories } from "@/lib/builder";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "5", 10), 50);

  const [articles, categories] = await Promise.all([
    fetchArticles(limit),
    fetchArticleCategories(),
  ]);

  return NextResponse.json(
    { articles, categories },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
  );
}

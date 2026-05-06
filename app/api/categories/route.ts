import { NextRequest, NextResponse } from "next/server";
import { fetchCategories } from "@/lib/articles-api";
import { withRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { reqId, blocked } = withRateLimit(request, 60, 60, "/api/categories");
  if (blocked) return blocked;

  try {
    const categories = await fetchCategories();
    return NextResponse.json(
      { categories },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error(`[${reqId}] /api/categories unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

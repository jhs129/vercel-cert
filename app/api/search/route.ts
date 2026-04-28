import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchArticles } from "@/lib/builder";
import { withRateLimit } from "@/lib/api-utils";

const querySchema = z.object({
  q: z.string().max(200).optional().default(""),
  category: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const { reqId, blocked } = withRateLimit(request, 60, 60, "/api/search");
  if (blocked) return blocked;

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { q, category } = parsed.data;
    const articles = await searchArticles(q.trim(), category ?? null);
    return NextResponse.json(articles);
  } catch (err) {
    console.error(`[${reqId}] /api/search unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

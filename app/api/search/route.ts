import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchArticles } from "@/lib/builder";
import { rateLimit } from "@/lib/rate-limit";

const querySchema = z.object({
  q: z.string().max(200).optional().default(""),
  category: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const reqId = crypto.randomUUID();

  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfter } = rateLimit(ip, 60, 60);
  if (!allowed) {
    console.error(`[${reqId}] Rate limit exceeded for IP ${ip} on /api/search`);
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
    const { q, category } = parsed.data;
    const articles = await searchArticles(q.trim(), category ?? null);
    return NextResponse.json(articles);
  } catch (err) {
    console.error(`[${reqId}] /api/search unexpected error`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

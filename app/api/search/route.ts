import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/builder";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") || null;

  const articles = await searchArticles(query, category);
  return NextResponse.json(articles);
}

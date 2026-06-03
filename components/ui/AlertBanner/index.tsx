import { AlertBannerClient } from "./AlertBannerClient";

export interface BreakingNewsItem {
  id: string;
  headline: string;
  summary: string;
  articleId: string;
  category: string;
  publishedAt: string;
  urgent: boolean;
}

export async function AlertBanner() {
  const apiBase = process.env.API_BASE;
  const bypassToken = process.env.API_BYPASS_TOKEN;

  if (!apiBase) return null;

  let item: BreakingNewsItem | null = null;
  try {
    const res = await fetch(`${apiBase}/api/breaking-news`, {
      headers: bypassToken ? { "x-vercel-protection-bypass": bypassToken } : {},
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        item = json.data as BreakingNewsItem;
      }
    }
  } catch {
    return null;
  }

  if (!item) return null;
  return <AlertBannerClient item={item} />;
}

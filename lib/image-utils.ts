import "server-only";
import { getPlaiceholder } from "plaiceholder";

const ALLOWED_BLUR_HOSTNAMES = new Set(["cdn.builder.io", "placehold.co"]);

export function generateColorPlaceholder(r: number, g: number, b: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="rgb(${r},${g},${b})"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function generateBlurPlaceholder(url: string): Promise<string> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !ALLOWED_BLUR_HOSTNAMES.has(parsed.hostname)) {
      return generateColorPlaceholder(128, 128, 128);
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const { base64 } = await getPlaiceholder(buffer);
    return base64;
  } catch (err) {
    console.error("[generateBlurPlaceholder] failed for url:", url, err);
    return generateColorPlaceholder(128, 128, 128);
  }
}

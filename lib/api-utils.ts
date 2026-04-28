import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export function extractIp(request: NextRequest): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export function withRateLimit(
  request: NextRequest,
  limit: number,
  windowSecs: number,
  endpoint: string
): { reqId: string; blocked: null } | { reqId: string; blocked: NextResponse } {
  const reqId = crypto.randomUUID();
  const ip = extractIp(request);
  const { allowed, retryAfter } = rateLimit(ip, limit, windowSecs);
  if (!allowed) {
    console.error(`[${reqId}] Rate limit exceeded for IP ${ip} on ${endpoint}`);
    return {
      reqId,
      blocked: NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
      ),
    };
  }
  return { reqId, blocked: null };
}

export const SUBSCRIPTION_COOKIE = "vd-subscribed";

// Server-side: read from Next.js cookies() — call only in async server components/middleware
export async function isSubscribedServer(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  return jar.get(SUBSCRIPTION_COOKIE)?.value === "1";
}

// Client-side: read from document.cookie
export function isSubscribedClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${SUBSCRIPTION_COOKIE}=`));
}

export function subscribeCookie(): void {
  document.cookie = `${SUBSCRIPTION_COOKIE}=1; path=/; max-age=31536000`;
}

export function unsubscribeCookie(): void {
  document.cookie = `${SUBSCRIPTION_COOKIE}=; path=/; max-age=0`;
}

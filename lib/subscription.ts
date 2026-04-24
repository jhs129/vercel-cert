export const SUBSCRIPTION_COOKIE = "vd-subscribed";

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

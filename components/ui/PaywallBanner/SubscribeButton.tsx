"use client";

import { subscribeCookie } from "@/lib/subscription";

export function SubscribeButton() {
  function handleSubscribe() {
    subscribeCookie();
    window.location.reload();
  }

  return (
    <button
      onClick={handleSubscribe}
      className="mt-2 bg-accent text-white font-semibold px-10 py-3 rounded-lg hover:opacity-90 transition-opacity"
      aria-label="Subscribe to read the full article"
    >
      Subscribe — it&#39;s free
    </button>
  );
}

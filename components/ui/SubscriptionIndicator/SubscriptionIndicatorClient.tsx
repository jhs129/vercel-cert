"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeCookie, unsubscribeCookie } from "@/lib/subscription";

interface SubscriptionIndicatorClientProps {
  initialSubscribed: boolean;
}

export function SubscriptionIndicatorClient({ initialSubscribed }: SubscriptionIndicatorClientProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const router = useRouter();

  function handleSubscribe() {
    subscribeCookie();
    setSubscribed(true);
    router.refresh();
  }

  function handleUnsubscribe() {
    unsubscribeCookie();
    setSubscribed(false);
    router.refresh();
  }

  if (subscribed) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-medium text-accent"
          aria-label="You are subscribed to Vercel Daily"
        >
          Subscribed
        </span>
        <button
          onClick={handleUnsubscribe}
          className="text-xs text-foreground underline hover:opacity-70 transition-opacity"
          aria-label="Unsubscribe from Vercel Daily"
        >
          Unsubscribe
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      aria-label="Subscribe to Vercel Daily"
    >
      Subscribe
    </button>
  );
}

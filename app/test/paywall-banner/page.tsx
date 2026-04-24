"use client";

import { useState } from "react";
import { PaywallBanner } from "@/components/ui/PaywallBanner";

export default function PaywallBannerTestPage() {
  const [revealed, setRevealed] = useState(false);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">PaywallBanner — Test Page</h1>
      {revealed ? (
        <p className="text-accent font-semibold">Full content revealed! (Subscribed state)</p>
      ) : (
        <PaywallBanner
          title="Why Vercel's Edge Network Changes Everything"
          heroImage="https://placehold.co/900x506.png"
          teaser="Modern web infrastructure is undergoing a fundamental shift. For years, developers had to choose between performance and simplicity — deploy globally and manage complexity, or keep it simple and accept latency. Vercel's edge network collapses that trade-off entirely, bringing compute to within milliseconds of every user on the planet."
          onSubscribe={() => setRevealed(true)}
        />
      )}
    </main>
  );
}

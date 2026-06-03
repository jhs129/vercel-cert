import { Suspense } from "react";
import type { NavLink } from "@/lib/types";
import { SubscriptionIndicator } from "@/components/ui/SubscriptionIndicator";
import { HeaderClient } from "./HeaderClient";

const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
];

export function Header({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  return (
    <HeaderClient
      links={links}
      subscriptionSlot={
        <Suspense fallback={null}>
          <SubscriptionIndicator />
        </Suspense>
      }
    />
  );
}

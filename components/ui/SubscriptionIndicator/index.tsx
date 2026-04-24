import { isSubscribedServer } from "@/lib/subscription.server";
import { SubscriptionIndicatorClient } from "./SubscriptionIndicatorClient";

export async function SubscriptionIndicator() {
  const subscribed = await isSubscribedServer();
  return <SubscriptionIndicatorClient initialSubscribed={subscribed} />;
}

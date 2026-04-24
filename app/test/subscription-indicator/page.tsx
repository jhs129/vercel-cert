import { SubscriptionIndicator } from "@/components/ui/SubscriptionIndicator";

export default function SubscriptionIndicatorTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">SubscriptionIndicator — Test Page</h1>
      <p className="text-muted text-sm">
        Click Subscribe/Unsubscribe to toggle state. Cookie persists across refreshes.
      </p>
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <span className="text-sm text-muted">In header context:</span>
        <SubscriptionIndicator />
      </div>
    </main>
  );
}

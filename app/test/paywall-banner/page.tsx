import { PaywallBanner } from "@/components/ui/PaywallBanner";

export default function PaywallBannerTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">PaywallBanner — Test Page</h1>
      <PaywallBanner teaser="Modern web infrastructure is undergoing a fundamental shift. For years, developers had to choose between performance and simplicity — deploy globally and manage complexity, or keep it simple and accept latency. Vercel's edge network collapses that trade-off entirely, bringing compute to within milliseconds of every user on the planet." />
    </main>
  );
}

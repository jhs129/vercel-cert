import { SubscribeButton } from "./SubscribeButton";

interface PaywallBannerProps {
  teaser: string;
}

export function PaywallBanner({ teaser }: PaywallBannerProps) {
  return (
    <div className="space-y-4">
      <div className="relative mb-2">
        <p className="text-foreground leading-relaxed">{teaser}</p>
        <div
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 py-10 border-t border-foreground/10">
        <p className="text-lg font-semibold text-foreground">
          Subscribe to read the full article
        </p>
        <p className="text-sm text-muted">Free, instant, no email required</p>
        <SubscribeButton />
      </div>
    </div>
  );
}

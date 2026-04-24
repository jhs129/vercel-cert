import { AlertBannerClient } from "@/components/ui/AlertBanner/AlertBannerClient";

export default function AlertBannerTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">AlertBanner — Test Page</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Breaking variant</h2>
        <AlertBannerClient
          alerts={[
            {
              id: "1",
              name: "Breaking Alert",
              published: "published",
              data: { variant: "breaking", label: "Breaking", message: "This is a breaking alert." },
            },
          ]}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Warning variant</h2>
        <AlertBannerClient
          alerts={[
            {
              id: "2",
              name: "Warning Alert",
              published: "published",
              data: { variant: "warning", label: "Warning", message: "Something needs your attention." },
            },
          ]}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Info variant</h2>
        <AlertBannerClient
          alerts={[
            {
              id: "3",
              name: "Info Alert",
              published: "published",
              data: { variant: "info", label: "Info", message: "This is an informational alert." },
            },
          ]}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Multiple alerts</h2>
        <AlertBannerClient
          alerts={[
            {
              id: "4",
              name: "First Alert",
              published: "published",
              data: { variant: "breaking", label: "Breaking", message: "First alert in a stack." },
            },
            {
              id: "5",
              name: "Second Alert",
              published: "published",
              data: { variant: "info", label: "Info", message: "Second alert in a stack." },
            },
          ]}
        />
      </section>
    </main>
  );
}

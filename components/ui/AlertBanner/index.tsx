import { headers } from "next/headers";
import { fetchEntries } from "@builder.io/sdk-react";
import { AlertBannerClient } from "./AlertBannerClient";
import type { AlertVariant } from "@/components/ui/Alert";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

export async function AlertBanner() {
  if (!BUILDER_API_KEY) return null;

  const headersList = await headers();
  const urlPath = headersList.get("x-pathname") ?? "/";

  // Intercept non-OK responses so the SDK doesn't log its own console.error
  const safeFetch = async (input: string, init?: object) => {
    const res = await fetch(input, init as RequestInit);
    if (!res.ok) return new Response(JSON.stringify({ results: [] }), { status: 200 });
    return res;
  };

  let entries: Awaited<ReturnType<typeof fetchEntries>> = [];
  try {
    entries = await fetchEntries({
      model: "alert",
      apiKey: BUILDER_API_KEY,
      userAttributes: { urlPath },
      fetch: safeFetch,
    });
  } catch {
    return null;
  }

  if (!entries.length) return null;

  const alerts = entries.map((entry) => ({
    id: entry.id ?? "",
    variant: (entry.data?.variant as AlertVariant) ?? "info",
    label: entry.data?.label as string | undefined,
    message: (entry.data?.message as string) ?? "",
  }));

  return <AlertBannerClient alerts={alerts} />;
}

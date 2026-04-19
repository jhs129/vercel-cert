import { headers } from "next/headers";
import { fetchEntries } from "@builder.io/sdk-react";
import { AlertBannerClient } from "./AlertBannerClient";
import type { CmsAlert } from "@/lib/cms-models";
import { BUILDER_API_KEY, safeFetch } from "@/lib/builder";

export async function AlertBanner() {
  if (!BUILDER_API_KEY) return null;

  const headersList = await headers();
  const urlPath = headersList.get("x-pathname") ?? "/";

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

  const alerts: CmsAlert[] = entries.map((entry) => ({
    id: entry.id ?? "",
    name: (entry.name as string) ?? "",
    published: (entry.published as string) ?? "",
    data: {
      variant: entry.data?.variant as string | undefined,
      label: (entry.data?.label as string) ?? "",
      message: (entry.data?.message as string) ?? "",
    },
  }));

  return <AlertBannerClient alerts={alerts} />;
}

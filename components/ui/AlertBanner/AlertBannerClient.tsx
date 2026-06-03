"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { DismissButton } from "@/components/ui/Alert/DismissButton";
import type { AlertVariant } from "@/components/ui/Alert";
import type { BreakingNewsItem } from ".";

interface AlertBannerClientProps {
  item: BreakingNewsItem;
}

const COOKIE_PREFIX = "alert-dismissed-";

function isDismissed(id: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_PREFIX}${id}=`));
}

function setDismissCookie(id: string) {
  document.cookie = `${COOKIE_PREFIX}${id}=1; path=/`;
}

export function AlertBannerClient({ item }: AlertBannerClientProps) {
  const [dismissed, setDismissed] = useState(() => isDismissed(item.id));

  if (dismissed) return null;

  function dismiss() {
    setDismissCookie(item.id);
    setDismissed(true);
  }

  const variant: AlertVariant = item.urgent ? "breaking" : "info";
  const label = item.category.replace(/-/g, " ");

  return (
    <Alert
      variant={variant}
      label={label}
      message={item.headline}
      href={`/content/${item.articleId}`}
      action={<DismissButton onClick={dismiss} />}
    />
  );
}

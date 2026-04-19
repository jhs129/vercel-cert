"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { DismissButton } from "@/components/ui/Alert/DismissButton";
import type { AlertVariant } from "@/components/ui/Alert";
import type { CmsAlert } from "@/lib/cms-models";

interface AlertBannerClientProps {
  alerts: CmsAlert[];
}

const COOKIE_PREFIX = "alert-dismissed-";

function getDismissedIds(): Set<string> {
  if (typeof document === "undefined") return new Set();
  return new Set(
    document.cookie
      .split("; ")
      .filter((c) => c.startsWith(COOKIE_PREFIX))
      .map((c) => c.slice(COOKIE_PREFIX.length).split("=")[0])
  );
}

function setDismissCookie(id: string) {
  document.cookie = `${COOKIE_PREFIX}${id}=1; path=/`;
}

export function AlertBannerClient({ alerts }: AlertBannerClientProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(getDismissedIds);

  function dismiss(id: string) {
    setDismissCookie(id);
    setDismissed((prev) => new Set([...prev, id]));
  }

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  return (
    <>
      {visible.map((alert) => (
        <Alert
          key={alert.id}
          variant={(alert.variant as AlertVariant) ?? "info"}
          label={alert.label}
          message={alert.message}
          action={<DismissButton onClick={() => dismiss(alert.id)} />}
        />
      ))}
    </>
  );
}

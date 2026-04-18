"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { DismissButton } from "@/components/ui/Alert/DismissButton";
import type { AlertVariant } from "@/components/ui/Alert";

export interface AlertItem {
  id: string;
  variant: AlertVariant;
  label?: string;
  message: string;
}

interface AlertBannerClientProps {
  alerts: AlertItem[];
}

const COOKIE_PREFIX = "alert-dismissed-";

function getDismissedIds(): Set<string> {
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
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDismissed(getDismissedIds());
  }, []);

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
          variant={alert.variant}
          label={alert.label}
          message={alert.message}
          action={<DismissButton onClick={() => dismiss(alert.id)} />}
        />
      ))}
    </>
  );
}

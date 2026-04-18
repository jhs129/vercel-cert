"use client";

import { Alert } from "@/components/ui/Alert";
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

export function AlertBannerClient({ alerts }: AlertBannerClientProps) {
  return (
    <>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          label={alert.label}
          message={alert.message}
        />
      ))}
    </>
  );
}

import Image from "next/image";
import type { ReactNode } from "react";

export type AlertVariant = "breaking" | "warning" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  label?: string;
  message: string;
  action?: ReactNode;
}

const variantStyles: Record<
  AlertVariant,
  { iconSrc: string; iconFilter: string; badgeBorder: string }
> = {
  breaking: {
    iconSrc: "/icons/warning.svg",
    iconFilter: "",
    badgeBorder: "border-white text-white",
  },
  warning: {
    iconSrc: "/icons/warning.svg",
    iconFilter: "brightness-0 saturate-100 invert-[83%] sepia-[98%] saturate-[1000%] hue-rotate-[5deg]",
    badgeBorder: "border-yellow-400 text-yellow-400",
  },
  info: {
    iconSrc: "/icons/info.svg",
    iconFilter: "brightness-0 saturate-100 invert-[48%] sepia-[98%] saturate-[500%] hue-rotate-[190deg]",
    badgeBorder: "border-blue-400 text-blue-400",
  },
};

export function Alert({ variant = "breaking", label, message, action }: AlertProps) {
  const { iconSrc, iconFilter, badgeBorder } = variantStyles[variant];

  return (
    <div
      className="w-full bg-black text-white flex items-center gap-3 px-6 py-3"
      role="alert"
      aria-live="polite"
    >
      <Image
        src={iconSrc}
        alt=""
        width={18}
        height={18}
        className={iconFilter}
        aria-hidden
      />
      {label && (
        <span
          className={`border font-bold text-xs uppercase tracking-wider px-2 py-0.5 shrink-0 ${badgeBorder}`}
        >
          {label}
        </span>
      )}
      <span className="text-sm">{message}</span>
      {action}
    </div>
  );
}
